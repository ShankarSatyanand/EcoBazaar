package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.CheckoutRequest;
import com.ecobazaar.backend.dto.OrderItemResponse;
import com.ecobazaar.backend.dto.OrderResponse;
import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.entity.CartItem;
import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.OrderItem;
import com.ecobazaar.backend.entity.OrderStatus;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.exception.ResourceNotFoundException;
import com.ecobazaar.backend.repository.CartRepository;
import com.ecobazaar.backend.repository.OrderRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * OrderService
 * Handles order checkout, lifecycle management, customer isolation,
 * inventory stock deduction, and cancellation restocking.
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final Random random = new Random();

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    /**
     * Executes atomic checkout for the customer's cart:
     * 1. Validates cart is not empty
     * 2. Checks inventory stock availability for all items
     * 3. Deducts product stock
     * 4. Persists the Order with immutable snapshots of OrderItems
     * 5. Empties the customer's cart
     *
     * @param customer the purchasing customer
     * @param request shipping and payment options
     * @return created OrderResponse
     */
    public OrderResponse checkout(User customer, CheckoutRequest request) {
        Cart cart = cartService.getOrCreateCart(customer);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        // 1. Stock validation pass
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProduct().getId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getStockQuantity() + ", requested: " + item.getQuantity());
            }
        }

        // 2. Prepare order entity
        String orderNumber = generateOrderNumber();
        BigDecimal totalAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        double totalCarbonKg = 0.0;

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setPaymentStatus(request.getPaymentMethod() != null ? request.getPaymentMethod() : "SIMULATED_PAID");
        order.setStatus(OrderStatus.PLACED);

        // 3. Deduct stock and build OrderItems
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId()).get();

            // Decrement inventory stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            double itemCarbon = (product.getCarbonFootprint() != null ? product.getCarbonFootprint() : 0.0) * item.getQuantity();

            totalAmount = totalAmount.add(subtotal);
            totalCarbonKg += itemCarbon;

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    product.getName(),
                    product.getPrice(),
                    item.getQuantity(),
                    subtotal,
                    product.getCarbonFootprint(),
                    Math.round(itemCarbon * 100.0) / 100.0
            );
            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setTotalCarbonKg(Math.round(totalCarbonKg * 100.0) / 100.0);

        Order savedOrder = orderRepository.save(order);

        // 4. Clear shopping cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    /**
     * Retrieves all orders belonging to the specified customer.
     *
     * @param customer the authenticated customer
     * @return list of orders sorted newest first
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(User customer) {
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    /**
     * Retrieves a single order by ID with customer isolation checks:
     * - Customer can only access their own orders
     * - Admin can view any order
     *
     * @param user the authenticated user
     * @param orderId order ID
     * @return OrderResponse
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Enforce customer isolation
        if (user.getRole() != Role.ADMIN && !order.getCustomer().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to view this order");
        }

        return mapToOrderResponse(order);
    }

    /**
     * Admin operation: Retrieve all orders across all customers.
     *
     * @return list of all orders sorted newest first
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    /**
     * Admin operation: Update an order's lifecycle status.
     * Validates transition rules and restores stock if an order is cancelled.
     *
     * @param orderId order ID
     * @param newStatus target status
     * @return updated OrderResponse
     */
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new IllegalStateException("Invalid status transition from " +
                    order.getStatus() + " to " + newStatus);
        }

        // Restock inventory if transitioning to CANCELLED
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    /**
     * Maps an Order entity to OrderResponse DTO.
     */
    public OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemResponses.add(new OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getSubtotal(),
                        item.getCarbonFootprint(),
                        item.getTotalCarbonKg()
                ));
            }
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getCustomer().getEmail(),
                order.getShippingAddress(),
                order.getPaymentStatus(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getTotalCarbonKg(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    /**
     * Generates a unique order tracking number: EB-YYYYMMDD-XXXXX
     */
    private String generateOrderNumber() {
        return "EB-" + System.currentTimeMillis() + "-" + String.format("%04d", random.nextInt(10000));
    }
}

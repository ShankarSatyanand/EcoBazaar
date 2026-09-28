package com.ecobazaar.backend;

import com.ecobazaar.backend.controller.CartController;
import com.ecobazaar.backend.controller.OrderController;
import com.ecobazaar.backend.dto.AddToCartRequest;
import com.ecobazaar.backend.dto.CartResponse;
import com.ecobazaar.backend.dto.CheckoutRequest;
import com.ecobazaar.backend.dto.OrderResponse;
import com.ecobazaar.backend.dto.UpdateCartItemRequest;
import com.ecobazaar.backend.dto.UpdateOrderStatusRequest;
import com.ecobazaar.backend.entity.OrderStatus;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.exception.ResourceNotFoundException;
import com.ecobazaar.backend.repository.CartRepository;
import com.ecobazaar.backend.repository.OrderRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CartOrderIntegrationTest {

    @Autowired
    private CartController cartController;

    @Autowired
    private OrderController orderController;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User customerA;
    private User customerB;
    private User adminUser;
    private Product testProduct1;
    private Product testProduct2;

    private CustomUserDetails setSecurityContext(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return userDetails;
    }

    @BeforeEach
    void setUp() {
        // Create customer A
        customerA = new User(
                "Shopper Alpha",
                "shopper.a." + System.currentTimeMillis() + "@example.com",
                passwordEncoder.encode("Pass@123"),
                Role.CUSTOMER
        );
        customerA = userRepository.save(customerA);

        // Create customer B
        customerB = new User(
                "Shopper Beta",
                "shopper.b." + System.currentTimeMillis() + "@example.com",
                passwordEncoder.encode("Pass@123"),
                Role.CUSTOMER
        );
        customerB = userRepository.save(customerB);

        // Create or get Admin
        adminUser = userRepository.findByEmailIgnoreCase("admin@ecobazaar.com")
                .orElseGet(() -> userRepository.save(new User(
                        "Eco Admin",
                        "admin@ecobazaar.com",
                        passwordEncoder.encode("Admin@123"),
                        Role.ADMIN
                )));

        // Create test product 1: 500 INR, 0.4 kg CO2e, 10 in stock
        testProduct1 = productRepository.save(new Product(
                "Reusable Hemp Shopping Bag",
                "Durable organic hemp tote bag",
                new BigDecimal("500.00"),
                "lifestyle",
                "https://example.com/bag.jpg",
                0.40,
                10,
                true
        ));

        // Create test product 2: 250 INR, 0.1 kg CO2e, 5 in stock
        testProduct2 = productRepository.save(new Product(
                "Bamboo Cutlery Travel Kit",
                "Portable bamboo fork, spoon, knife, and chopsticks",
                new BigDecimal("250.00"),
                "lifestyle",
                "https://example.com/cutlery.jpg",
                0.10,
                5,
                true
        ));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();

        // Clean up orders and carts for customer A & B
        if (customerA != null && customerA.getId() != null) {
            orderRepository.findByCustomerOrderByCreatedAtDesc(customerA)
                    .forEach(order -> orderRepository.deleteById(order.getId()));
            cartRepository.findByUser(customerA).ifPresent(c -> cartRepository.deleteById(c.getId()));
            userRepository.deleteById(customerA.getId());
        }

        if (customerB != null && customerB.getId() != null) {
            orderRepository.findByCustomerOrderByCreatedAtDesc(customerB)
                    .forEach(order -> orderRepository.deleteById(order.getId()));
            cartRepository.findByUser(customerB).ifPresent(c -> cartRepository.deleteById(c.getId()));
            userRepository.deleteById(customerB.getId());
        }

        // Clean up test products
        if (testProduct1 != null && testProduct1.getId() != null) {
            productRepository.deleteById(testProduct1.getId());
        }
        if (testProduct2 != null && testProduct2.getId() != null) {
            productRepository.deleteById(testProduct2.getId());
        }
    }

    @Test
    @DisplayName("Cart Operations: Add, accumulate, update quantity, remove, and calculate totals accurately")
    void testCartLifecycleAndCalculations() {
        CustomUserDetails userDetailsA = setSecurityContext(customerA);

        // 1. Initial cart should be empty
        ResponseEntity<CartResponse> initialCart = cartController.getCart(userDetailsA);
        assertEquals(HttpStatus.OK, initialCart.getStatusCode());
        assertNotNull(initialCart.getBody());
        assertEquals(0, initialCart.getBody().getItemCount());
        assertEquals(0, BigDecimal.ZERO.compareTo(initialCart.getBody().getTotalAmount()));
        assertEquals(0.0, initialCart.getBody().getTotalCarbonKg());

        // 2. Add 2 units of testProduct1 (500 * 2 = 1000 INR, 0.40 * 2 = 0.80 kg CO2)
        AddToCartRequest addReq1 = new AddToCartRequest(testProduct1.getId(), 2);
        ResponseEntity<CartResponse> afterAdd1 = cartController.addToCart(userDetailsA, addReq1);
        assertEquals(HttpStatus.CREATED, afterAdd1.getStatusCode());
        CartResponse cartData = afterAdd1.getBody();
        assertNotNull(cartData);
        assertEquals(1, cartData.getItems().size());
        assertEquals(2, cartData.getItemCount());
        assertEquals(new BigDecimal("1000.00"), cartData.getTotalAmount());
        assertEquals(0.80, cartData.getTotalCarbonKg());

        // 3. Accumulate: Add 1 more unit of testProduct1 (2 + 1 = 3 units -> 1500 INR, 1.20 kg CO2)
        AddToCartRequest addReq2 = new AddToCartRequest(testProduct1.getId(), 1);
        ResponseEntity<CartResponse> afterAdd2 = cartController.addToCart(userDetailsA, addReq2);
        assertEquals(3, afterAdd2.getBody().getItemCount());
        assertEquals(new BigDecimal("1500.00"), afterAdd2.getBody().getTotalAmount());
        assertEquals(1.20, afterAdd2.getBody().getTotalCarbonKg());

        // 4. Add testProduct2: 2 units (250 * 2 = 500 INR, 0.10 * 2 = 0.20 kg CO2)
        AddToCartRequest addReq3 = new AddToCartRequest(testProduct2.getId(), 2);
        ResponseEntity<CartResponse> afterAdd3 = cartController.addToCart(userDetailsA, addReq3);
        assertEquals(2, afterAdd3.getBody().getItems().size());
        assertEquals(5, afterAdd3.getBody().getItemCount());
        assertEquals(new BigDecimal("2000.00"), afterAdd3.getBody().getTotalAmount());
        assertEquals(1.40, afterAdd3.getBody().getTotalCarbonKg());

        Long item1Id = afterAdd3.getBody().getItems().stream()
                .filter(i -> i.getProductId().equals(testProduct1.getId()))
                .findFirst().orElseThrow().getId();

        // 5. Update quantity of testProduct1 from 3 to 1
        UpdateCartItemRequest updateReq = new UpdateCartItemRequest(1);
        ResponseEntity<CartResponse> afterUpdate = cartController.updateItemQuantity(userDetailsA, item1Id, updateReq);
        assertEquals(3, afterUpdate.getBody().getItemCount()); // 1 of product 1 + 2 of product 2
        assertEquals(new BigDecimal("1000.00"), afterUpdate.getBody().getTotalAmount()); // 500 + 500 = 1000
        assertEquals(0.60, afterUpdate.getBody().getTotalCarbonKg()); // 0.40 + 0.20 = 0.60

        // 6. Remove testProduct1 from cart
        ResponseEntity<CartResponse> afterRemove = cartController.removeItem(userDetailsA, item1Id);
        assertEquals(1, afterRemove.getBody().getItems().size());
        assertEquals(2, afterRemove.getBody().getItemCount());
        assertEquals(new BigDecimal("500.00"), afterRemove.getBody().getTotalAmount());

        // 7. Clear entire cart
        ResponseEntity<CartResponse> afterClear = cartController.clearCart(userDetailsA);
        assertEquals(0, afterClear.getBody().getItems().size());
        assertEquals(0, afterClear.getBody().getItemCount());
        assertEquals(0, BigDecimal.ZERO.compareTo(afterClear.getBody().getTotalAmount()));
    }

    @Test
    @DisplayName("Stock validation: Cannot add or update more than available inventory")
    void testStockLimitsValidation() {
        CustomUserDetails userDetailsA = setSecurityContext(customerA);

        // testProduct2 has 5 in stock. Attempting to add 6 should fail.
        AddToCartRequest overLimitAdd = new AddToCartRequest(testProduct2.getId(), 6);
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> cartController.addToCart(userDetailsA, overLimitAdd));
        assertTrue(ex.getMessage().contains("exceeds available stock"));

        // Add 4 units (valid)
        cartController.addToCart(userDetailsA, new AddToCartRequest(testProduct2.getId(), 4));

        // Adding 2 more would total 6 (over 5 stock) -> should fail
        AddToCartRequest overLimitAccumulate = new AddToCartRequest(testProduct2.getId(), 2);
        assertThrows(IllegalStateException.class,
                () -> cartController.addToCart(userDetailsA, overLimitAccumulate));

        // Cart should still have 4
        CartResponse cart = cartController.getCart(userDetailsA).getBody();
        assertNotNull(cart);
        Long itemId = cart.getItems().get(0).getId();

        // Updating item directly to 10 -> should fail
        assertThrows(IllegalStateException.class,
                () -> cartController.updateItemQuantity(userDetailsA, itemId, new UpdateCartItemRequest(10)));
    }

    @Test
    @DisplayName("Customer Isolation: Customer cannot modify another customer's cart or orders")
    void testCustomerIsolation() {
        CustomUserDetails userDetailsA = setSecurityContext(customerA);

        // Customer A adds an item to cart
        ResponseEntity<CartResponse> respA = cartController.addToCart(userDetailsA, new AddToCartRequest(testProduct1.getId(), 1));
        Long itemAId = respA.getBody().getItems().get(0).getId();

        // Switch to Customer B
        CustomUserDetails userDetailsB = setSecurityContext(customerB);

        // Customer B attempts to update or delete Customer A's cart item -> should fail (not found in B's cart)
        assertThrows(ResourceNotFoundException.class,
                () -> cartController.updateItemQuantity(userDetailsB, itemAId, new UpdateCartItemRequest(2)));
        assertThrows(ResourceNotFoundException.class,
                () -> cartController.removeItem(userDetailsB, itemAId));

        // Switch back to Customer A to place an order
        setSecurityContext(customerA);
        CheckoutRequest checkoutReq = new CheckoutRequest("123 Green St, Eco City", "CARD");
        ResponseEntity<OrderResponse> orderA = orderController.checkout(userDetailsA, checkoutReq);
        Long orderAId = orderA.getBody().getId();

        // Switch back to Customer B: Customer B attempts to view Customer A's order -> should be rejected
        setSecurityContext(customerB);
        assertThrows(AccessDeniedException.class,
                () -> orderController.getOrderById(userDetailsB, orderAId));
    }

    @Test
    @DisplayName("Checkout: Stock is decremented, cart is cleared, snapshots preserved, order created with PLACED status")
    void testCheckoutFlow() {
        CustomUserDetails userDetailsA = setSecurityContext(customerA);

        // Attempt checkout on empty cart -> fails
        assertThrows(IllegalStateException.class,
                () -> orderController.checkout(userDetailsA, new CheckoutRequest("Address 1")));

        // Add 3 units of testProduct1 (starts with 10 stock)
        cartController.addToCart(userDetailsA, new AddToCartRequest(testProduct1.getId(), 3));
        // Add 2 units of testProduct2 (starts with 5 stock)
        cartController.addToCart(userDetailsA, new AddToCartRequest(testProduct2.getId(), 2));

        CheckoutRequest checkoutReq = new CheckoutRequest("456 Sustainable Blvd, Earth City", "SIMULATED_UPI");
        ResponseEntity<OrderResponse> orderResponse = orderController.checkout(userDetailsA, checkoutReq);

        assertEquals(HttpStatus.CREATED, orderResponse.getStatusCode());
        OrderResponse order = orderResponse.getBody();
        assertNotNull(order);
        assertNotNull(order.getOrderNumber());
        assertTrue(order.getOrderNumber().startsWith("EB-"));
        assertEquals(customerA.getId(), order.getCustomerId());
        assertEquals("PLACED", order.getStatus());
        assertEquals("456 Sustainable Blvd, Earth City", order.getShippingAddress());
        assertEquals("SIMULATED_UPI", order.getPaymentStatus());
        assertEquals(2, order.getItems().size());
        assertEquals(new BigDecimal("2000.00"), order.getTotalAmount()); // (500*3) + (250*2) = 1500 + 500 = 2000
        assertEquals(1.40, order.getTotalCarbonKg()); // (0.4*3) + (0.1*2) = 1.2 + 0.2 = 1.4

        // Verify inventory stock was decremented
        Product refreshedP1 = productRepository.findById(testProduct1.getId()).orElseThrow();
        Product refreshedP2 = productRepository.findById(testProduct2.getId()).orElseThrow();
        assertEquals(7, refreshedP1.getStockQuantity(), "Stock should drop from 10 to 7");
        assertEquals(3, refreshedP2.getStockQuantity(), "Stock should drop from 5 to 3");

        // Verify cart is now completely empty
        CartResponse postCheckoutCart = cartController.getCart(userDetailsA).getBody();
        assertNotNull(postCheckoutCart);
        assertEquals(0, postCheckoutCart.getItemCount());
        assertTrue(postCheckoutCart.getItems().isEmpty());

        // Verify customer can retrieve their own order by ID and via order history
        ResponseEntity<OrderResponse> fetchedOrder = orderController.getOrderById(userDetailsA, order.getId());
        assertEquals(HttpStatus.OK, fetchedOrder.getStatusCode());
        assertEquals(order.getId(), fetchedOrder.getBody().getId());

        ResponseEntity<List<OrderResponse>> customerOrders = orderController.getOrders(userDetailsA);
        assertEquals(1, customerOrders.getBody().size());
        assertEquals(order.getId(), customerOrders.getBody().get(0).getId());
    }

    @Test
    @DisplayName("Admin Order Management: View all orders, valid transitions, invalid transition rejection, and stock restoration on CANCELLED")
    void testAdminOrderStatusTransitionsAndRestocking() {
        CustomUserDetails userDetailsA = setSecurityContext(customerA);

        // Place an order for 4 units of testProduct1 (initial stock = 10)
        cartController.addToCart(userDetailsA, new AddToCartRequest(testProduct1.getId(), 4));
        OrderResponse placedOrder = orderController.checkout(userDetailsA,
                new CheckoutRequest("Admin Test Street", "CARD")).getBody();
        assertNotNull(placedOrder);
        Long orderId = placedOrder.getId();

        // Stock is now 6
        assertEquals(6, productRepository.findById(testProduct1.getId()).orElseThrow().getStockQuantity());

        // Switch security context to Admin
        CustomUserDetails adminDetails = setSecurityContext(adminUser);

        // Admin can view all orders
        ResponseEntity<List<OrderResponse>> allOrders = orderController.getAllOrdersAdmin();
        assertTrue(allOrders.getBody().stream().anyMatch(o -> o.getId().equals(orderId)));

        // Invalid transition: PLACED -> DELIVERED (skipping CONFIRMED/SHIPPED) should be rejected
        assertThrows(IllegalStateException.class,
                () -> orderController.updateOrderStatus(orderId, new UpdateOrderStatusRequest(OrderStatus.DELIVERED)));

        // Valid transition: PLACED -> CONFIRMED
        ResponseEntity<OrderResponse> confirmed = orderController.updateOrderStatus(orderId,
                new UpdateOrderStatusRequest(OrderStatus.CONFIRMED));
        assertEquals("CONFIRMED", confirmed.getBody().getStatus());

        // Valid transition: CONFIRMED -> SHIPPED
        ResponseEntity<OrderResponse> shipped = orderController.updateOrderStatus(orderId,
                new UpdateOrderStatusRequest(OrderStatus.SHIPPED));
        assertEquals("SHIPPED", shipped.getBody().getStatus());

        // Valid transition: SHIPPED -> CANCELLED (stock should be replenished!)
        ResponseEntity<OrderResponse> cancelled = orderController.updateOrderStatus(orderId,
                new UpdateOrderStatusRequest(OrderStatus.CANCELLED));
        assertEquals("CANCELLED", cancelled.getBody().getStatus());

        // Verify stock was restored to 10
        Product restockedProduct = productRepository.findById(testProduct1.getId()).orElseThrow();
        assertEquals(10, restockedProduct.getStockQuantity(), "Stock should be restored from 6 back to 10 on cancellation");

        // Terminal state test: Cannot transition from CANCELLED to anything else
        assertThrows(IllegalStateException.class,
                () -> orderController.updateOrderStatus(orderId, new UpdateOrderStatusRequest(OrderStatus.CONFIRMED)));
    }
}

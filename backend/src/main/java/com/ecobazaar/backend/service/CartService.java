package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.AddToCartRequest;
import com.ecobazaar.backend.dto.CartItemResponse;
import com.ecobazaar.backend.dto.CartResponse;
import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.entity.CartItem;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.exception.ResourceNotFoundException;
import com.ecobazaar.backend.repository.CartItemRepository;
import com.ecobazaar.backend.repository.CartRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * CartService
 * Manages customer shopping carts:
 * - Isolation per customer
 * - Adding, updating, removing items
 * - Stock availability validation
 * - Accurate financial subtotal (BigDecimal) and carbon footprint computations
 */
@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    /**
     * Retrieve or initialize the unique shopping cart for the given customer.
     *
     * @param user the authenticated customer
     * @return active Cart entity
     */
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    /**
     * Retrieves the formatted CartResponse DTO for the customer.
     *
     * @param user the authenticated customer
     * @return populated CartResponse
     */
    public CartResponse getCustomerCart(User user) {
        Cart cart = getOrCreateCart(user);
        return mapToCartResponse(cart);
    }

    /**
     * Adds a product to the customer's cart with the requested quantity.
     * Validates that the requested quantity is within available stock limits.
     *
     * @param user the authenticated customer
     * @param request the add to cart payload
     * @return updated CartResponse
     */
    public CartResponse addToCart(User user, AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Cart cart = getOrCreateCart(user);

        // Check if product is already in this customer's cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        int targetQuantity = (existingItem != null)
                ? existingItem.getQuantity() + request.getQuantity()
                : request.getQuantity();

        if (targetQuantity > product.getStockQuantity()) {
            throw new IllegalStateException("Requested quantity (" + targetQuantity +
                    ") exceeds available stock (" + product.getStockQuantity() + ")");
        }

        if (existingItem != null) {
            existingItem.setQuantity(targetQuantity);
        } else {
            CartItem newItem = new CartItem(cart, product, targetQuantity);
            cart.addItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    /**
     * Updates the quantity of a specific item in the customer's cart.
     * Enforces user isolation so customers can only modify items in their own cart.
     *
     * @param user the authenticated customer
     * @param itemId cart item ID
     * @param newQuantity the updated quantity
     * @return updated CartResponse
     */
    public CartResponse updateCartItemQuantity(User user, Long itemId, int newQuantity) {
        if (newQuantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByIdAndCart(itemId, cart)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (newQuantity > item.getProduct().getStockQuantity()) {
            throw new IllegalStateException("Requested quantity (" + newQuantity +
                    ") exceeds available stock (" + item.getProduct().getStockQuantity() + ")");
        }

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        return mapToCartResponse(cart);
    }

    /**
     * Removes an item from the customer's cart.
     *
     * @param user the authenticated customer
     * @param itemId cart item ID to remove
     * @return updated CartResponse
     */
    public CartResponse removeCartItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByIdAndCart(itemId, cart)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        cart.removeItem(item);
        cartItemRepository.delete(item);

        return mapToCartResponse(cart);
    }

    /**
     * Clears all items from the customer's cart.
     *
     * @param user the authenticated customer
     * @return empty CartResponse
     */
    public CartResponse clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        Cart saved = cartRepository.save(cart);
        return mapToCartResponse(saved);
    }

    /**
     * Maps a Cart entity to CartResponse DTO, aggregating totals.
     *
     * @param cart the cart entity
     * @return populated CartResponse
     */
    public CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        double totalCarbonKg = 0.0;
        int totalItemCount = 0;

        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            BigDecimal subtotal = item.getSubtotal().setScale(2, RoundingMode.HALF_UP);
            Double itemCarbon = item.getTotalCarbonKg();

            totalAmount = totalAmount.add(subtotal);
            totalCarbonKg += itemCarbon;
            totalItemCount += item.getQuantity();

            itemResponses.add(new CartItemResponse(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getImageUrl(),
                    p.getPrice(),
                    item.getQuantity(),
                    subtotal,
                    p.getCarbonFootprint(),
                    Math.round(itemCarbon * 100.0) / 100.0,
                    p.getStockQuantity()
            ));
        }

        return new CartResponse(
                cart.getId(),
                itemResponses,
                totalAmount,
                Math.round(totalCarbonKg * 100.0) / 100.0,
                totalItemCount
        );
    }
}

package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.AddToCartRequest;
import com.ecobazaar.backend.dto.CartResponse;
import com.ecobazaar.backend.dto.UpdateCartItemRequest;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.exception.ResourceNotFoundException;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.security.CustomUserDetails;
import com.ecobazaar.backend.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * CartController
 * REST controller for customer shopping cart operations:
 * - GET    /api/cart              : View current customer's cart
 * - POST   /api/cart/items        : Add product to cart with quantity
 * - PUT    /api/cart/items/{id}   : Update quantity of a cart item
 * - DELETE /api/cart/items/{id}   : Remove an item from cart
 * - DELETE /api/cart              : Clear all items from cart
 *
 * All cart endpoints are strictly isolated per authenticated CUSTOMER.
 */
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080"
})
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(CustomUserDetails userDetails) {
        return userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    /**
     * GET /api/cart
     * Retrieves the authenticated customer's current shopping cart.
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CartResponse response = cartService.getCustomerCart(user);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/cart/items
     * Adds an item to the shopping cart.
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @Valid @RequestBody AddToCartRequest request) {
        User user = getAuthenticatedUser(userDetails);
        CartResponse response = cartService.addToCart(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/cart/items/{itemId}
     * Updates the quantity of an existing item in the customer's cart.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                          @PathVariable Long itemId,
                                                          @Valid @RequestBody UpdateCartItemRequest request) {
        User user = getAuthenticatedUser(userDetails);
        CartResponse response = cartService.updateCartItemQuantity(user, itemId, request.getQuantity());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart/items/{itemId}
     * Removes an item from the customer's cart.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                   @PathVariable Long itemId) {
        User user = getAuthenticatedUser(userDetails);
        CartResponse response = cartService.removeCartItem(user, itemId);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart
     * Empties all items from the customer's cart.
     */
    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CartResponse response = cartService.clearCart(user);
        return ResponseEntity.ok(response);
    }
}

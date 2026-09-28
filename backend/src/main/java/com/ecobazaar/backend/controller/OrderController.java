package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.CheckoutRequest;
import com.ecobazaar.backend.dto.OrderResponse;
import com.ecobazaar.backend.dto.UpdateOrderStatusRequest;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.exception.ResourceNotFoundException;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.security.CustomUserDetails;
import com.ecobazaar.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * OrderController
 * REST controller for order management:
 * - POST /api/orders/checkout     : Customer converts active cart into a placed order (CUSTOMER)
 * - GET  /api/orders              : Customer views their own order history (CUSTOMER / ADMIN)
 * - GET  /api/orders/{id}         : Customer views a specific order they placed, or Admin views it
 * - GET  /api/orders/admin/all    : Admin views all orders across the platform (ADMIN)
 * - PUT  /api/orders/{id}/status  : Admin updates order lifecycle status (ADMIN)
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080"
})
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(CustomUserDetails userDetails) {
        return userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    /**
     * POST /api/orders/checkout
     * Converts the current customer's cart items into a newly placed order.
     */
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> checkout(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @Valid @RequestBody CheckoutRequest request) {
        User customer = getAuthenticatedUser(userDetails);
        OrderResponse response = orderService.checkout(customer, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/orders
     * Retrieves the order history for the currently logged in customer.
     * If user is ADMIN, returns all platform orders.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponse>> getOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<OrderResponse> orders = (user.getRole() == Role.ADMIN)
                ? orderService.getAllOrdersAdmin()
                : orderService.getCustomerOrders(user);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id}
     * Retrieves a single order by ID with customer isolation enforcement.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrderById(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                     @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        OrderResponse order = orderService.getOrderById(user, id);
        return ResponseEntity.ok(order);
    }

    /**
     * GET /api/orders/admin/all
     * Retrieves all customer orders across the platform (Admin only).
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrdersAdmin() {
        List<OrderResponse> orders = orderService.getAllOrdersAdmin();
        return ResponseEntity.ok(orders);
    }

    /**
     * PUT /api/orders/{id}/status
     * Updates an order's lifecycle status (Admin only).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                           @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse updated = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}

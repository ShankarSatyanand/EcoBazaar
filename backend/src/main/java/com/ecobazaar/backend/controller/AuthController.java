package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.AuthResponse;
import com.ecobazaar.backend.dto.LoginRequest;
import com.ecobazaar.backend.dto.RegisterRequest;
import com.ecobazaar.backend.dto.UserResponse;
import com.ecobazaar.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController
 * Exposes REST endpoints for user authentication:
 * - POST /api/auth/register : Register a new customer
 * - POST /api/auth/login    : Authenticate and obtain JWT token
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Public user registration endpoint.
     * Always assigns the CUSTOMER role and returns safe user information without password.
     *
     * @param request the registration details
     * @return HTTP 201 Created with user details
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * User login endpoint.
     * Verifies credentials and returns a signed JWT bearer token.
     *
     * @param request login credentials (email and password)
     * @return HTTP 200 OK with AuthResponse
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}

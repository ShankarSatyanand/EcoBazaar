package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.AuthResponse;
import com.ecobazaar.backend.dto.LoginRequest;
import com.ecobazaar.backend.dto.RegisterRequest;
import com.ecobazaar.backend.dto.UserResponse;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService
 * Business logic layer for user registration and authentication.
 * Enforces CUSTOMER role on public registration and secures credential handling.
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Register a new shopper account.
     * Enforces unique email check, BCrypt password hashing, and default CUSTOMER role.
     *
     * @param request the registration details
     * @return safe UserResponse without password or hash
     */
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Reject duplicate email registration
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered: " + normalizedEmail);
        }

        // Hash password securely with BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Strictly assign CUSTOMER role by default (never from public input)
        User newUser = new User(
                request.getFullName().trim(),
                normalizedEmail,
                hashedPassword,
                Role.CUSTOMER
        );

        User savedUser = userRepository.save(newUser);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                "User registered successfully"
        );
    }

    /**
     * Authenticate user credentials and issue a signed JWT token.
     *
     * @param request the login credentials
     * @return AuthResponse with JWT token and basic profile info
     */
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        try {
            // Verify credentials via Spring Security's AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            // Retrieve the authenticated user entity
            User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            // Generate signed JWT token
            String token = jwtTokenProvider.generateToken(user);

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().name()
            );
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }
}

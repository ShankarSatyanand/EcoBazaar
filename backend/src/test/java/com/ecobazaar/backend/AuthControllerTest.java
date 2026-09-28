package com.ecobazaar.backend;

import com.ecobazaar.backend.controller.AuthController;
import com.ecobazaar.backend.dto.AuthResponse;
import com.ecobazaar.backend.dto.LoginRequest;
import com.ecobazaar.backend.dto.RegisterRequest;
import com.ecobazaar.backend.dto.UserResponse;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthControllerTest {

    @Autowired
    private AuthController authController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("POST /api/auth/register should register customer and return 201 Created")
    void testRegisterUser() {
        String uniqueEmail = "newshopper_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest request = new RegisterRequest("New Shopper", uniqueEmail, "Shopper@123");

        ResponseEntity<UserResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("New Shopper", response.getBody().getFullName());
        assertEquals(uniqueEmail, response.getBody().getEmail());
        assertEquals(Role.CUSTOMER.name(), response.getBody().getRole(), "Must be CUSTOMER role by default");

        // Verify duplicate registration is rejected
        assertThrows(IllegalArgumentException.class, () -> authController.register(request));

        // Clean up
        userRepository.deleteById(response.getBody().getId());
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate and return signed JWT token")
    void testLoginSuccessAndFailure() {
        // Register user first
        String email = "logintest_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest("Login Tester", email, "SecurePass@123");
        ResponseEntity<UserResponse> regResponse = authController.register(registerReq);
        Long userId = regResponse.getBody().getId();

        // Successful login
        LoginRequest loginReq = new LoginRequest(email, "SecurePass@123");
        ResponseEntity<AuthResponse> loginResponse = authController.login(loginReq);

        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody());
        assertNotNull(loginResponse.getBody().getToken());
        assertEquals("Bearer", loginResponse.getBody().getType());
        assertEquals(email, loginResponse.getBody().getEmail());
        assertEquals(Role.CUSTOMER.name(), loginResponse.getBody().getRole());

        // Verify JWT token validity
        assertTrue(jwtTokenProvider.validateToken(loginResponse.getBody().getToken()));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(loginResponse.getBody().getToken()));
        assertEquals(Role.CUSTOMER.name(), jwtTokenProvider.getRoleFromToken(loginResponse.getBody().getToken()));

        // Failed login with wrong password
        LoginRequest wrongPassReq = new LoginRequest(email, "WrongPassword@999");
        assertThrows(BadCredentialsException.class, () -> authController.login(wrongPassReq));

        // Clean up
        userRepository.deleteById(userId);
    }
}

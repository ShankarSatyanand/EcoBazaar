package com.ecobazaar.backend.config;

import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Should skip seeding if ADMIN_EMAIL or ADMIN_PASSWORD is empty or null")
    void testSkipWhenCredentialsMissing() {
        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, "", "");
        initializer.run();

        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Should skip seeding if admin user already exists")
    void testSkipWhenAdminAlreadyExists() {
        String adminEmail = "admin@ecobazaar.com";
        when(userRepository.existsByEmailIgnoreCase(adminEmail)).thenReturn(true);

        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, adminEmail, "AdminSecret123!");
        initializer.run();

        verify(userRepository, times(1)).existsByEmailIgnoreCase(adminEmail);
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Should seed admin user when credentials provided and admin does not exist")
    void testSeedWhenCredentialsProvidedAndNotExists() {
        String adminEmail = "admin@ecobazaar.com";
        String plainPassword = "AdminSecret123!";
        String encodedPassword = "$2a$10$encodedPasswordHashMock";

        when(userRepository.existsByEmailIgnoreCase(adminEmail)).thenReturn(false);
        when(passwordEncoder.encode(plainPassword)).thenReturn(encodedPassword);

        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, adminEmail, plainPassword);
        initializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals(adminEmail, savedUser.getEmail());
        assertEquals(encodedPassword, savedUser.getPassword());
        assertEquals(Role.ADMIN, savedUser.getRole());
    }
}

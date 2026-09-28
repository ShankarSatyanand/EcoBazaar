package com.ecobazaar.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    @Test
    @DisplayName("Should throw IllegalArgumentException when secret is null")
    void testNullSecretThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> new JwtTokenProvider(null, 86400000)
        );
        assertTrue(ex.getMessage().contains("JWT_SECRET environment variable is missing or shorter than 32 characters"));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when secret is shorter than 32 characters (256 bits)")
    void testShortSecretThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> new JwtTokenProvider("short-secret-key-too-short", 86400000)
        );
        assertTrue(ex.getMessage().contains("JWT_SECRET environment variable is missing or shorter than 32 characters"));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when secret is blank or whitespace")
    void testBlankSecretThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> new JwtTokenProvider("   ", 86400000)
        );
        assertTrue(ex.getMessage().contains("JWT_SECRET environment variable is missing or shorter than 32 characters"));
    }

    @Test
    @DisplayName("Should initialize successfully when secret is at least 32 characters (256 bits)")
    void testValidSecretInitializesSuccessfully() {
        String validSecret = "ThisIsAValidSecretKeyForTestingHMACSHA256WithMoreThan32Chars";
        assertDoesNotThrow(() -> new JwtTokenProvider(validSecret, 86400000));
    }
}

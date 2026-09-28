package com.ecobazaar.backend.config;

import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer
 * Seeds initial admin user if configured via ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 * If credentials are not provided, skips initialization cleanly.
 * Does NOT insert duplicates on subsequent application restarts.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:${ADMIN_EMAIL:}}") String adminEmail,
            @Value("${app.admin.password:${ADMIN_PASSWORD:}}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail != null ? adminEmail.trim() : "";
        this.adminPassword = adminPassword != null ? adminPassword.trim() : "";
    }

    @Override
    public void run(String... args) {
        if (adminEmail.isEmpty() || adminPassword.isEmpty()) {
            logger.info("ADMIN_EMAIL or ADMIN_PASSWORD environment variable not set. Skipping initial administrator account creation.");
            return;
        }

        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            logger.info("Seeding initial ADMIN user: {}", adminEmail);

            User admin = new User(
                    "EcoBazaar Administrator",
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN
            );

            userRepository.save(admin);
            logger.info("Initial ADMIN user seeded successfully.");
        } else {
            logger.info("ADMIN user ({}) already exists, skipping initial user seed.", adminEmail);
        }
    }
}

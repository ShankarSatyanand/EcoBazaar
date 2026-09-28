package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository
 * Spring Data JPA repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address (case-insensitive).
     *
     * @param email user email
     * @return Optional containing the user if found
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Check if a user with the specified email address already exists.
     *
     * @param email user email
     * @return true if user exists, false otherwise
     */
    boolean existsByEmailIgnoreCase(String email);
}

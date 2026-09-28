package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CartRepository
 * Data access operations for Cart entities.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Long userId);
}

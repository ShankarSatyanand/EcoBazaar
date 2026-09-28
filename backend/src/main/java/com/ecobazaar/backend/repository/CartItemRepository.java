package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.entity.CartItem;
import com.ecobazaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CartItemRepository
 * Data access operations for CartItem entities.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByIdAndCart(Long id, Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}

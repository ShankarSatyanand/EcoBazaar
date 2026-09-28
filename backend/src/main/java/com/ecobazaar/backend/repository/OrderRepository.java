package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * OrderRepository
 * Data access operations for Order entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);

    Optional<Order> findByIdAndCustomer(Long id, User customer);

    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);
}

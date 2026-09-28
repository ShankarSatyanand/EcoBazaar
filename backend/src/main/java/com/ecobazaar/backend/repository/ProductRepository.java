package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ProductRepository
 * Provides CRUD operations and custom query methods for the Product entity
 * using Spring Data JPA.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Find products belonging to a specific category (case-insensitive).
     *
     * @param category the category name
     * @return list of matching products
     */
    List<Product> findByCategoryIgnoreCase(String category);

    /**
     * Find all products flagged as eco-friendly.
     *
     * @param ecoFriendly boolean flag
     * @return list of eco-friendly products
     */
    List<Product> findByEcoFriendly(Boolean ecoFriendly);

    /**
     * Check if a product with the given name already exists.
     *
     * @param name product name
     * @return true if product exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);
}

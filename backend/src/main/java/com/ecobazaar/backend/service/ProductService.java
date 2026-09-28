package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * ProductService
 * Business logic layer for managing EcoBazaar sustainable products.
 * Handles product creation, retrieval, updates, and deletion.
 */
@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    // Constructor injection (Spring best practice)
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retrieve all products from the database.
     *
     * @return list of all products
     */
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Retrieve a single product by its unique ID.
     *
     * @param id the product ID
     * @return an Optional containing the product if found, or empty if not
     */
    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * Create and persist a new product.
     *
     * @param product the product to save
     * @return the saved product with its generated ID
     */
    public Product createProduct(Product product) {
        // Ensure id is null so Hibernate generates a fresh ID
        product.setId(null);

        // Default ecoFriendly flag to true if not specified
        if (product.getEcoFriendly() == null) {
            product.setEcoFriendly(true);
        }

        return productRepository.save(product);
    }

    /**
     * Update an existing product by ID.
     *
     * @param id the ID of the product to update
     * @param updatedProduct the product data with updated fields
     * @return an Optional containing the updated product if found, or empty if not
     */
    public Optional<Product> updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existingProduct -> {
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setImageUrl(updatedProduct.getImageUrl());
            existingProduct.setCarbonFootprint(updatedProduct.getCarbonFootprint());
            existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
            if (updatedProduct.getEcoFriendly() != null) {
                existingProduct.setEcoFriendly(updatedProduct.getEcoFriendly());
            }
            return productRepository.save(existingProduct);
        });
    }

    /**
     * Delete an existing product by ID.
     *
     * @param id the ID of the product to delete
     * @return true if the product was found and deleted, false if not found
     */
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

package com.ecobazaar.backend;

import com.ecobazaar.backend.controller.HealthController;
import com.ecobazaar.backend.controller.ProductController;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ProductControllerTest {

    @Autowired
    private HealthController healthController;

    @Autowired
    private ProductController productController;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("GET /api/health should return running status")
    void testHealthEndpoint() {
        String healthStatus = healthController.checkHealth();
        assertNotNull(healthStatus);
        assertEquals("EcoBazaar Backend is running!", healthStatus);
    }

    @Test
    @DisplayName("GET /api/products should return HTTP 200 and all products")
    void testGetAllProducts() {
        ResponseEntity<List<Product>> response = productController.getAllProducts();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().size() >= 10, "Expected at least 10 seeded products");
    }

    @Test
    @DisplayName("GET /api/products/{id} should return 200 for existing and 404 for non-existent")
    void testGetProductById() {
        // Test existing product ID 1
        ResponseEntity<Product> found = productController.getProductById(1L);
        assertEquals(HttpStatus.OK, found.getStatusCode());
        assertNotNull(found.getBody());
        assertEquals(1L, found.getBody().getId());
        assertEquals("Bamboo Charcoal Toothbrush (Set of 4)", found.getBody().getName());

        // Test non-existent product ID
        ResponseEntity<Product> notFound = productController.getProductById(999999L);
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
        assertNull(notFound.getBody());
    }

    @Test
    @DisplayName("POST /api/products should create product and return 201 Created")
    void testCreateProduct() {
        Product newProduct = new Product(
                "Upcycled Denim Laptop Sleeve",
                "Padded laptop sleeve handcrafted from post-consumer recycled denim.",
                new BigDecimal("849.00"),
                "tech",
                "https://example.com/denim-sleeve.jpg",
                0.35,
                40,
                true
        );

        ResponseEntity<Product> response = productController.createProduct(newProduct);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
        assertEquals("Upcycled Denim Laptop Sleeve", response.getBody().getName());
        assertEquals(new BigDecimal("849.00"), response.getBody().getPrice());

        // Clean up created product
        productRepository.deleteById(response.getBody().getId());
    }

    @Test
    @DisplayName("PUT /api/products/{id} should update product (200 OK) or return 404")
    void testUpdateProduct() {
        // Create temporary product to update
        Product temp = new Product(
                "Temporary Test Bottle",
                "Temporary description",
                new BigDecimal("299.00"),
                "lifestyle",
                "https://example.com/temp.jpg",
                0.25,
                20,
                true
        );
        Product saved = productRepository.save(temp);
        Long id = saved.getId();

        // Update product
        Product updatePayload = new Product(
                "Updated Test Bottle",
                "Updated description with more details",
                new BigDecimal("349.00"),
                "lifestyle",
                "https://example.com/temp-updated.jpg",
                0.20,
                25,
                true
        );

        ResponseEntity<Product> updateResponse = productController.updateProduct(id, updatePayload);
        assertEquals(HttpStatus.OK, updateResponse.getStatusCode());
        assertNotNull(updateResponse.getBody());
        assertEquals("Updated Test Bottle", updateResponse.getBody().getName());
        assertEquals(new BigDecimal("349.00"), updateResponse.getBody().getPrice());
        assertEquals(25, updateResponse.getBody().getStockQuantity());

        // Test non-existent ID -> 404 Not Found
        ResponseEntity<Product> notFoundResponse = productController.updateProduct(999999L, updatePayload);
        assertEquals(HttpStatus.NOT_FOUND, notFoundResponse.getStatusCode());

        // Clean up
        productRepository.deleteById(id);
    }

    @Test
    @DisplayName("DELETE /api/products/{id} should return 204 No Content for existing and 404 for non-existent")
    void testDeleteProduct() {
        // Create temporary product
        Product temp = new Product(
                "Delete Test Product",
                "To be deleted",
                new BigDecimal("99.00"),
                "lifestyle",
                "https://example.com/delete.jpg",
                0.05,
                5,
                true
        );
        Product saved = productRepository.save(temp);
        Long id = saved.getId();

        // Delete existing product -> 204 No Content
        ResponseEntity<Void> deleteResponse = productController.deleteProduct(id);
        assertEquals(HttpStatus.NO_CONTENT, deleteResponse.getStatusCode());

        // Verify product no longer exists in repository
        assertFalse(productRepository.existsById(id));

        // Delete non-existent product -> 404 Not Found
        ResponseEntity<Void> deleteAgainResponse = productController.deleteProduct(id);
        assertEquals(HttpStatus.NOT_FOUND, deleteAgainResponse.getStatusCode());
    }
}

package com.ecobazaar.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Product Entity
 * Represents an eco-friendly product listed in EcoBazaar with transparent
 * pricing, inventory, and estimated carbon footprint (kg CO2e).
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @PositiveOrZero(message = "Carbon footprint cannot be negative")
    @Column(name = "carbon_footprint")
    private Double carbonFootprint;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "eco_friendly")
    private Boolean ecoFriendly = true;

    // Default no-argument constructor (required by JPA)
    public Product() {
    }

    // Parameterized constructor for convenience
    public Product(String name, String description, BigDecimal price, String category,
                   String imageUrl, Double carbonFootprint, Integer stockQuantity, Boolean ecoFriendly) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.carbonFootprint = carbonFootprint;
        this.stockQuantity = stockQuantity;
        this.ecoFriendly = (ecoFriendly != null) ? ecoFriendly : true;
    }

    // Full constructor including ID
    public Product(Long id, String name, String description, BigDecimal price, String category,
                   String imageUrl, Double carbonFootprint, Integer stockQuantity, Boolean ecoFriendly) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.carbonFootprint = carbonFootprint;
        this.stockQuantity = stockQuantity;
        this.ecoFriendly = (ecoFriendly != null) ? ecoFriendly : true;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getCarbonFootprint() {
        return carbonFootprint;
    }

    public void setCarbonFootprint(Double carbonFootprint) {
        this.carbonFootprint = carbonFootprint;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Boolean getEcoFriendly() {
        return ecoFriendly;
    }

    public void setEcoFriendly(Boolean ecoFriendly) {
        this.ecoFriendly = ecoFriendly;
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                ", carbonFootprint=" + carbonFootprint +
                ", stockQuantity=" + stockQuantity +
                ", ecoFriendly=" + ecoFriendly +
                '}';
    }
}

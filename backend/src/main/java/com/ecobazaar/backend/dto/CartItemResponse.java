package com.ecobazaar.backend.dto;

import java.math.BigDecimal;

/**
 * CartItemResponse
 * Item detail representation returned in cart views.
 */
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Double carbonFootprint;
    private Double itemCarbonTotal;
    private Integer stockQuantity;

    public CartItemResponse() {
    }

    public CartItemResponse(Long id, Long productId, String productName, String imageUrl,
                            BigDecimal unitPrice, Integer quantity, BigDecimal subtotal,
                            Double carbonFootprint, Double itemCarbonTotal, Integer stockQuantity) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.carbonFootprint = carbonFootprint;
        this.itemCarbonTotal = itemCarbonTotal;
        this.stockQuantity = stockQuantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Double getCarbonFootprint() {
        return carbonFootprint;
    }

    public void setCarbonFootprint(Double carbonFootprint) {
        this.carbonFootprint = carbonFootprint;
    }

    public Double getItemCarbonTotal() {
        return itemCarbonTotal;
    }

    public void setItemCarbonTotal(Double itemCarbonTotal) {
        this.itemCarbonTotal = itemCarbonTotal;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}

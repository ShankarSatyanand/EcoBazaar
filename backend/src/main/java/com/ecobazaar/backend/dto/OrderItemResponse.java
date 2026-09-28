package com.ecobazaar.backend.dto;

import java.math.BigDecimal;

/**
 * OrderItemResponse
 * Line item representation within an order response.
 */
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Double carbonFootprint;
    private Double totalCarbonKg;

    public OrderItemResponse() {
    }

    public OrderItemResponse(Long id, Long productId, String productName, BigDecimal unitPrice,
                             Integer quantity, BigDecimal subtotal, Double carbonFootprint, Double totalCarbonKg) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.carbonFootprint = carbonFootprint;
        this.totalCarbonKg = totalCarbonKg;
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

    public Double getTotalCarbonKg() {
        return totalCarbonKg;
    }

    public void setTotalCarbonKg(Double totalCarbonKg) {
        this.totalCarbonKg = totalCarbonKg;
    }
}

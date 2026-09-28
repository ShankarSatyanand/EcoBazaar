package com.ecobazaar.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * OrderResponse
 * Comprehensive details of a placed or historical order.
 */
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String shippingAddress;
    private String paymentStatus;
    private String status;
    private BigDecimal totalAmount;
    private Double totalCarbonKg;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items = new ArrayList<>();

    public OrderResponse() {
    }

    public OrderResponse(Long id, String orderNumber, Long customerId, String customerName,
                         String customerEmail, String shippingAddress, String paymentStatus,
                         String status, BigDecimal totalAmount, Double totalCarbonKg,
                         LocalDateTime createdAt, List<OrderItemResponse> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.shippingAddress = shippingAddress;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.totalAmount = totalAmount;
        this.totalCarbonKg = totalCarbonKg;
        this.createdAt = createdAt;
        this.items = (items != null) ? items : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getTotalCarbonKg() {
        return totalCarbonKg;
    }

    public void setTotalCarbonKg(Double totalCarbonKg) {
        this.totalCarbonKg = totalCarbonKg;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}

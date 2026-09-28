package com.ecobazaar.backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * CartResponse
 * Full shopping cart details including all line items, totals, and carbon calculations.
 */
public class CartResponse {

    private Long id;
    private List<CartItemResponse> items = new ArrayList<>();
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private Double totalCarbonKg = 0.0;
    private Integer itemCount = 0;

    public CartResponse() {
    }

    public CartResponse(Long id, List<CartItemResponse> items, BigDecimal totalAmount,
                        Double totalCarbonKg, Integer itemCount) {
        this.id = id;
        this.items = (items != null) ? items : new ArrayList<>();
        this.totalAmount = (totalAmount != null) ? totalAmount : BigDecimal.ZERO;
        this.totalCarbonKg = (totalCarbonKg != null) ? totalCarbonKg : 0.0;
        this.itemCount = (itemCount != null) ? itemCount : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
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

    public Integer getItemCount() {
        return itemCount;
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }
}

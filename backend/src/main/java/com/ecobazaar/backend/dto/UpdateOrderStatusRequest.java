package com.ecobazaar.backend.dto;

import com.ecobazaar.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * UpdateOrderStatusRequest
 * Payload used by administrators to transition an order's lifecycle status.
 */
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}

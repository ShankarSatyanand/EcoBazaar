package com.ecobazaar.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * CheckoutRequest
 * Payload for turning the active shopping cart into a confirmed order.
 */
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String paymentMethod = "SIMULATED_CARD";

    public CheckoutRequest() {
    }

    public CheckoutRequest(String shippingAddress) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = "SIMULATED_CARD";
    }

    public CheckoutRequest(String shippingAddress, String paymentMethod) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = (paymentMethod != null && !paymentMethod.isBlank()) ? paymentMethod : "SIMULATED_CARD";
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}

package com.ecobazaar.backend.entity;

/**
 * OrderStatus
 * Represents the lifecycle stages of an EcoBazaar customer order.
 */
public enum OrderStatus {
    PLACED,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Validates whether a state transition from this status to targetStatus is permitted.
     * Rules:
     * - PLACED can transition to CONFIRMED or CANCELLED.
     * - CONFIRMED can transition to SHIPPED or CANCELLED.
     * - SHIPPED can transition to DELIVERED or CANCELLED.
     * - DELIVERED and CANCELLED are terminal states (no further transitions allowed).
     *
     * @param targetStatus the desired next status
     * @return true if valid, false otherwise
     */
    public boolean canTransitionTo(OrderStatus targetStatus) {
        if (targetStatus == null || this == targetStatus) {
            return false;
        }

        return switch (this) {
            case PLACED -> targetStatus == CONFIRMED || targetStatus == CANCELLED;
            case CONFIRMED -> targetStatus == SHIPPED || targetStatus == CANCELLED;
            case SHIPPED -> targetStatus == DELIVERED || targetStatus == CANCELLED;
            case DELIVERED, CANCELLED -> false; // Terminal states
        };
    }
}

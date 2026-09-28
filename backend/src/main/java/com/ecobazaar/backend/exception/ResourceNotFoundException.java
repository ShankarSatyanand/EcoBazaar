package com.ecobazaar.backend.exception;

/**
 * ResourceNotFoundException
 * Thrown when an entity (Product, CartItem, Order, User) cannot be found by its identifier.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

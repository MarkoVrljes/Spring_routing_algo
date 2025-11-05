package com.marko.routing_backend.exception;

import lombok.Getter;

@Getter
public class GraphValidationException extends RuntimeException {
    private final String field;
    
    public GraphValidationException(String message, String field) {
        super(message);
        this.field = field;
    }
    
    public GraphValidationException(String message) {
        this(message, null);
    }
}
package com.enderdev.enderdoesbackend.exceptions;

public class ExistingEmailConflictException extends RuntimeException {
    public ExistingEmailConflictException(String message) {
        super(message);
    }
}
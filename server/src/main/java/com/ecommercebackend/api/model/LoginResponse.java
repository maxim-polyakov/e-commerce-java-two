package com.ecommercebackend.api.model;

import lombok.Data;

/**
 * The response object sent from login request.
 */
@Data
public class LoginResponse {
    private String jwt;
    private boolean success;
    private String failureReason;
}
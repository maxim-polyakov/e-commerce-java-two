package com.ecommercebackend.api.model;

import lombok.Data;

@Data
public class PaymentBody {
    private String amount;
    private String description;
    private String confirmationReturnUrl;
}
package com.ecommercebackend.api.model;

public class PaymentBody {
    private String amount;
    private String description;
    private String confirmationReturnUrl;

    // Конструктор по умолчанию
    public PaymentBody() {
    }

    // Геттеры и сеттеры
    public String getAmount() {
        return amount;
    }

    public void setAmount(String amountValue) {
        this.amount = amountValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getConfirmationReturnUrl() {
        return confirmationReturnUrl;
    }

    public void setConfirmationReturnUrl(String confirmationReturnUrl) {
        this.confirmationReturnUrl = confirmationReturnUrl;
    }
}
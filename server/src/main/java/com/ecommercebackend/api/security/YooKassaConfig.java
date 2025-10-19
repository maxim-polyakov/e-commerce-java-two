package com.ecommercebackend.api.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class YooKassaConfig {

    @Value("${yookassa.shop.id}")
    private String shopId;

    @Value("${yookassa.secret.key}")
    private String secretKey;

    @Value("${yookassa.test.mode:true}")
    private boolean testMode;

    public String getShopId() {
        return shopId;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public boolean isTestMode() {
        return testMode;
    }
}
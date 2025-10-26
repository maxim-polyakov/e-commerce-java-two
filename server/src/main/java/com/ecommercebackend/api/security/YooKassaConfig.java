package com.ecommercebackend.api.security;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class YooKassaConfig {

    @Value("${yookassa.shop.id}")
    private String shopId;

    @Value("${yookassa.secret.key}")
    private String secretKey;

    @Value("${yookassa.test.mode:true}")
    private boolean testMode;
}
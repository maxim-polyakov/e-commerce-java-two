package com.ecommercebackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "yandex.delivery.api")
@Data
public class YandexDeliveryConfig {

    private String token;
    private String url;
    private String platform_id;
}
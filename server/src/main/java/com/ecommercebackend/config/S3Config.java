package com.ecommercebackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "yandex.storage") // Префикс для свойств
public class S3Config {
    private String accessKey;
    private String secretKey;
    private String bucketName;
    private String endpoint = "https://storage.yandexcloud.net";
}
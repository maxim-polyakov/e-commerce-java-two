package com.ecommercebackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import lombok.Data;

@Configuration
@PropertySource("classpath:application.properties")
@Data
public class UploadConfig {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.web-path}")
    private String webPath;
}
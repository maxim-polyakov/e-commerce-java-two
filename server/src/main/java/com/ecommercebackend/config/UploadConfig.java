package com.ecommercebackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import lombok.Data;

import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
@Data
public class UploadConfig {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.web-path:/images/}")
    private String webPath;

    @PostConstruct
    public void init() {
        try {
            // Создаем директорию, если не существует
            Files.createDirectories(Paths.get(uploadDir));
            System.out.println("Upload directory initialized: " + uploadDir);
        } catch (Exception e) {
            System.err.println("Warning: Could not create upload directory: " + e.getMessage());
        }
    }
}
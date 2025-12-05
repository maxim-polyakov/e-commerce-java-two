package com.ecommercebackend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(title = "E-commerce API", version = "1.0.0"),
    security = {@SecurityRequirement(name = "bearerAuth")} // Применяет схему по умолчанию ко всем endpoint'ам
)
@SecurityScheme(
    name = "bearerAuth", // Название схемы (должно совпадать с name в SecurityRequirement)
    type = SecuritySchemeType.HTTP, // Тип - HTTP
    scheme = "bearer", // Схема - Bearer
    bearerFormat = "JWT" // Указываем, что формат токена - JWT
)
public class OpenApiConfig {
    // Класс может быть пустым, все настройки задаются через аннотации выше
}
package com.ecommercebackend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${swagger.server.url:http://localhost:8080}")
    private String serverUrl;


    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Информация о API
                .info(new Info()
                        .title("E-commerce API")
                        .version("1.0")
                        .description("""
                            REST API для e-commerce приложения.
                            
                            **Основные возможности:**
                            - Управление пользователями и аутентификация
                            - Каталог товаров с изображениями
                            - Корзина покупок и оформление заказов
                            - Платежи через ЮKassa
                            - Технические описания товаров
                            - Управление адресами доставки
                            """)
                        .contact(new Contact()
                                .name("Polyakov Maxim")
                                .email("maxim7012@gmail.com")
                                .url("https://baxic.ru/"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0")))

                // Настройка серверов
                .servers(List.of(
                        new Server()
                                .url(serverUrl)
                                .description("Локальный сервер разработки"),
                        new Server()
                                .url("https://ecommerceapi.baxic.ru")
                                .description("Продакшен сервер")
                ))

                // Настройка безопасности (JWT)
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Введите JWT токен в формате: Bearer <token>")))

                // Применение схемы безопасности ко всем endpoint'ам по умолчанию
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * The response object sent from login request.
 */
@Data
@Schema(description = "Ответ после попытки аутентификации пользователя")
public class LoginResponse {

    @Schema(
        description = "JWT токен для авторизованных запросов",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6Ikl2YW4gSXZhbm92IiwiaWF0IjoxNzA0NDY4MDAwLCJleHAiOjE3MDQ0NzE2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        nullable = true,
        format = "jwt"
    )
    private String jwt;

    @Schema(
        description = "Флаг успешности аутентификации",
        example = "true",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private boolean success;

    @Schema(
        description = "Причина неудачной аутентификации (если success = false)",
        example = "Неверный email или пароль",
        nullable = true,
        allowableValues = {
            "Неверный email или пароль",
            "Аккаунт не подтвержден",
            "Аккаунт заблокирован",
            "Превышено количество попыток"
        }
    )
    private String failureReason;
}
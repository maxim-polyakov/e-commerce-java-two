package com.ecommercebackend.api.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * The body for the login requests.
 */
@Data
@Schema(description = "Тело запроса для аутентификации пользователя")
public class LoginBody {

    @NotNull
    @NotBlank
    @Pattern(
        regexp = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$",
        message = "Неверный формат email адреса"
    )
    @Schema(
        description = "Email или логин пользователя для входа в систему",
        example = "user@example.com",
        format = "email",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 255
    )
    private String usernameoremail;

    @NotNull
    @NotBlank
    @Schema(
        description = "Пароль пользователя",
        example = "yourPassword123",
        format = "password",  // Будет отображаться как поле для пароля (звёздочки)
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 6,
        maxLength = 32
    )
    private String password;
}
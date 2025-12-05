package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body to reset a password using a password reset token.
 */
@Data
@Schema(description = "Тело запроса для сброса пароля с использованием токена")
public class PasswordResetBody {

    @NotNull
    @NotBlank
    @Size(min = 10, max = 500)
    @Schema(
        description = "Токен для сброса пароля (полученный по email)",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        format = "jwt",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 10,
        maxLength = 500
    )
    private String token;

    @NotNull
    @NotBlank
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)[\\w!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{6,}$",
        message = "Пароль должен содержать хотя бы одну букву и одну цифру"
    )
    @Size(min = 6, max = 32)
    @Schema(
        description = "Новый пароль пользователя",
        example = "NewPassword123",
        format = "password",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 6,
        maxLength = 32,
        pattern = "^(?=.*[A-Za-z])(?=.*\\d)[\\w!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{6,}$"
    )
    private String password;
}
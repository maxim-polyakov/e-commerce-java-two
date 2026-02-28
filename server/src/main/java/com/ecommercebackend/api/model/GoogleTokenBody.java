package com.ecommercebackend.api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Тело запроса для входа через Google OAuth.
 */
@Data
@Schema(description = "Тело запроса для аутентификации через Google")
public class GoogleTokenBody {

    @NotBlank(message = "Google ID token обязателен")
    @Schema(
        description = "Google ID token (credential.credential) из Google Sign-In",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String idToken;
}

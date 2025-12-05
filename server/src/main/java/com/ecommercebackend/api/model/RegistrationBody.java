package com.ecommercebackend.api.model;

import com.ecommercebackend.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * The information required to register a user.
 */
@Data
@Schema(description = "Тело запроса для регистрации нового пользователя")
public class RegistrationBody {

    @NotNull
    @NotBlank
    @Size(min = 3, max = 255)
    @Schema(
        description = "Имя пользователя (логин)",
        example = "johndoe",
        minLength = 3,
        maxLength = 255
    )
    private String username;

    @NotNull
    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$")
    @Schema(
        description = "Электронная почта пользователя",
        example = "john.doe@example.com",
        format = "email"  // Указываем явно, что это email, а не пароль
    )
    private String email;

    @NotNull
    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[\\w!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{6,}$")
    @Size(min = 6, max = 32)
    @Schema(
        description = "Пароль пользователя",
        example = "Password123",
        minLength = 6,
        maxLength = 32,
        format = "password"  // Указываем формат пароля (будет скрыт звёздочками)
    )
    private String password;

    @NotNull
    @NotBlank
    @Schema(
        description = "Имя пользователя",
        example = "John"
    )
    private String firstName;

    /** The last name. */
    @NotNull
    @NotBlank
    @Schema(
        description = "Фамилия пользователя",
        example = "Doe"
    )
    private String lastName;

    @Schema(
        description = "Роль пользователя в системе",
        example = "USER",
        allowableValues = {"USER", "ADMIN"},
        defaultValue = "USER"
    )
    private Role role;
}
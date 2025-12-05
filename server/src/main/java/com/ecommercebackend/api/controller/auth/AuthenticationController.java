package com.ecommercebackend.api.controller.auth;

import com.ecommercebackend.api.model.LoginBody;
import com.ecommercebackend.api.model.LoginResponse;
import com.ecommercebackend.api.model.PasswordResetBody;
import com.ecommercebackend.api.model.RegistrationBody;
import com.ecommercebackend.exception.EmailFailureException;
import com.ecommercebackend.exception.EmailNotFoundException;
import com.ecommercebackend.exception.UserAlreadyExistsException;
import com.ecommercebackend.exception.UserNotVerifiedException;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.service.JWTService;
import com.ecommercebackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Rest Controller for handling authentication requests.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Авторизация", description = "API для аутентификации и управления пользователями")
public class AuthenticationController {

    /** The user service. */
    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    @Operation(
        summary = "Регистрация нового пользователя",
        description = "Создает нового пользователя в системе"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Пользователь успешно зарегистрирован"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Пользователь с таким email или username уже существует"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Внутренняя ошибка сервера при отправке email подтверждения"
        )
    })
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegistrationBody registrationBody) {
        try {
            userService.registerUser(registrationBody);
            return ResponseEntity.ok().build();
        } catch (UserAlreadyExistsException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (EmailFailureException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    @Operation(
        summary = "Аутентификация пользователя",
        description = "Авторизация пользователя в системе. Возвращает JWT токен для последующих запросов."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Успешная аутентификация",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Неверные учетные данные"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Пользователь не подтвержден",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Внутренняя ошибка сервера"
        )
    })
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginBody loginBody) {
        String jwt = null;
        try {
            jwt = userService.loginUser(loginBody);
        } catch (UserNotVerifiedException ex) {
            LoginResponse response = new LoginResponse();
            response.setSuccess(false);
            String reason = "USER_NOT_VERIFIED";
            if (ex.isNewEmailSent()) {
                reason += "_EMAIL_RESENT";
            }
            response.setFailureReason(reason);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (EmailFailureException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } else {
            LoginResponse response = new LoginResponse();
            response.setJwt(jwt);
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/verify")
    @Operation(
        summary = "Подтверждение email",
        description = "Активация учетной записи пользователя по токену подтверждения"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email успешно подтвержден"),
        @ApiResponse(responseCode = "409", description = "Неверный или просроченный токен")
    })
    public ResponseEntity<Void> verifyEmail(
        @Parameter(
            description = "Токен подтверждения из email",
            required = true,
            example = "abc123def456"
        )
        @RequestParam String token) {
        if (userService.verifyUser(token)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/me")
    @Operation(
        summary = "Получение профиля текущего пользователя",
        description = "Возвращает информацию об аутентифицированном пользователе"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Успешно",
            content = @Content(schema = @Schema(implementation = LocalUser.class))
        ),
        @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    public LocalUser getLoggedInUserProfile(@AuthenticationPrincipal LocalUser user) {
        return user;
    }

    @PostMapping("/forgot")
    @Operation(
        summary = "Запрос сброса пароля",
        description = "Отправляет email со ссылкой для сброса пароля"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email с инструкциями отправлен"),
        @ApiResponse(responseCode = "400", description = "Пользователь с таким email не найден"),
        @ApiResponse(responseCode = "500", description = "Ошибка при отправке email")
    })
    public ResponseEntity<Void> forgotPassword(
        @Parameter(
            description = "Email пользователя",
            required = true,
            example = "user@example.com"
        )
        @RequestParam String email) {
        try {
            userService.forgotPassword(email);
            return ResponseEntity.ok().build();
        } catch (EmailNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (EmailFailureException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset")
    @Operation(
        summary = "Сброс пароля",
        description = "Установка нового пароля по токену сброса"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пароль успешно изменен"),
        @ApiResponse(responseCode = "400", description = "Неверный или просроченный токен")
    })
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetBody body) {
        userService.resetPassword(body);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    @Operation(
        summary = "Проверка аутентификации",
        description = "Проверяет, авторизован ли пользователь, и возвращает новый JWT токен"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Пользователь аутентифицирован",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))
        ),
        @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
        @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    public ResponseEntity<LoginResponse> check(@AuthenticationPrincipal LocalUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Генерация JWT токена по аналогии с loginUser
        String jwt = jwtService.generateJWT(user);

        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } else {
            LoginResponse response = new LoginResponse();
            response.setJwt(jwt);
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        }
    }
}
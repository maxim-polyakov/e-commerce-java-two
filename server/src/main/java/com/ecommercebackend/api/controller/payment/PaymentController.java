package com.ecommercebackend.api.controller.payment;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.api.model.PaymentBody;
import com.ecommercebackend.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ru.loolzaaa.youkassa.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to handle payment requests.
 */
@RestController
@RequestMapping("/pay")
@Tag(name = "Платежи", description = "API для работы с платежами через ЮKassa")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    @Operation(
        summary = "Создать платеж",
        description = """
            Создает новый платеж через ЮKassa для аутентифицированного пользователя.
            
            **Процесс работы:**
            1. Пользователь отправляет данные платежа
            2. Сервер создает платеж в ЮKassa
            3. Возвращается объект платежа с `confirmation_url`
            4. Пользователь перенаправляется на этот URL для оплаты
            
            Требуется JWT токен авторизации.
            """
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Платеж успешно создан",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Payment.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные платежа (неверная сумма, описание и т.д.)"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "402",
            description = "Ошибка платежной системы"
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Не удалось создать платеж (неверные параметры, ограничения ЮKassa)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Внутренняя ошибка сервера"
        )
    })
    public Payment createOrder(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,

        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Данные для создания платежа",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PaymentBody.class)
            )
        )
        @Valid @RequestBody PaymentBody body) {

        return paymentService.createPayment(
            body.getAmount(),
            body.getDescription(),
            body.getConfirmationReturnUrl()
        );
    }
}
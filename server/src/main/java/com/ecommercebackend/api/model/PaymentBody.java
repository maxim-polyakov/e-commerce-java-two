package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Тело запроса для создания платежа через ЮKassa")
public class PaymentBody {

    @NotNull
    @NotBlank
    @Pattern(
        regexp = "^\\d+(\\.\\d{1,2})?$",
        message = "Некорректный формат суммы. Пример: 100.50 или 100"
    )
    @Schema(
        description = "Сумма платежа в рублях",
        example = "1499.99",
        pattern = "^\\d+(\\.\\d{1,2})?$",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 1,
        maxLength = 20
    )
    private String amount;

    @NotNull
    @NotBlank
    @Schema(
        description = "Описание платежа (отображается пользователю в ЮKassa)",
        example = "Оплата заказа #ORD-2023-001",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 128
    )
    private String description;

    @NotNull
    @NotBlank
    @Schema(
        description = "URL для возврата после подтверждения платежа",
        example = "https://your-shop.com/payment/success",
        format = "uri",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 2048
    )
    private String confirmationReturnUrl;
}
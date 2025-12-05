package com.ecommercebackend.api.controller.order;

import com.ecommercebackend.api.model.RegistrationBody;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller to handle requests to create, update and view orders.
 */
@RestController
@RequestMapping("/order")
@Tag(name = "Заказы", description = "API для управления заказами пользователей")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    @Operation(
        summary = "Получить список заказов пользователя",
        description = "Возвращает все заказы, связанные с аутентифицированным пользователем. Требуется JWT токен."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Список заказов успешно получен",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = WebOrder.class))
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав для просмотра заказов"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Внутренняя ошибка сервера"
        )
    })
    public List<WebOrder> getOrders(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user) {

        return orderService.getOrders(user);
    }

    @PostMapping("/create")
    @Operation(
        summary = "Создать новый заказ",
        description = "Создает новый заказ для аутентифицированного пользователя. Требуется JWT токен."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Заказ успешно создан",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WebOrder.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные заказа"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав для создания заказа"
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Невозможно создать заказ (например, товара нет в наличии)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Внутренняя ошибка сервера"
        )
    })
    public WebOrder createOrder(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,

        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Данные нового заказа",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WebOrder.class)
            )
        )
        @Valid @RequestBody WebOrder order) {

        return orderService.createOrder(order, user);
    }
}
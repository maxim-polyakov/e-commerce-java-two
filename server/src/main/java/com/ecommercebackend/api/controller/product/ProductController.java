package com.ecommercebackend.api.controller.product;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.api.model.ProductBody;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

/**
 * Controller to handle the creation, updating & viewing of products.
 */
@RestController
@RequestMapping("/product")
@Tag(name = "Товары", description = "API для управления товарами магазина")
public class ProductController {

    /** The Product Service. */
    @Autowired
    private ProductService productService;

    @GetMapping
    @Operation(
        summary = "Получить список товаров с пагинацией",
        description = "Возвращает страницу товаров с поддержкой пагинации. Без авторизации."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Список товаров успешно получен",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные параметры пагинации"
        )
    })
    public Page<Product> getProducts(
            @Parameter(description = "Номер страницы (начиная с 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Количество товаров на странице", example = "10")
            @RequestParam(defaultValue = "10") int size) {

        return productService.getProducts(page, size);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Получить товар по ID",
        description = "Возвращает подробную информацию о товаре по его идентификатору. Без авторизации."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Товар найден",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Product.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Товар с указанным ID не найден"
        )
    })
    public Product getProductById(
            @Parameter(description = "ID товара", required = true, example = "1")
            @PathVariable Long id) {

        return productService.getProductById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Создать новый товар",
        description = """
            Создает новый товар с загрузкой изображения.
            
            **Важно:** Требуется авторизация (обычно только для администраторов/модераторов).
            Для отправки данных используйте `multipart/form-data`.
            """
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Товар успешно создан",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Product.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные товара или ошибка загрузки изображения"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав для создания товара"
        )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Данные нового товара с изображением",
        required = true,
        content = @Content(
            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
            schema = @Schema(implementation = ProductBody.class)
        )
    )
    public Product createProduct(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,

        @Parameter(hidden = true) // Скрываем, так как тело описано через @RequestBody
        @ModelAttribute ProductBody productData) {

        return productService.createProduct(user, productData);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Удалить товар",
        description = "Удаляет товар по его идентификатору. Требуется авторизация (обычно только для администраторов)."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Товар успешно удален",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "string", example = "Product deleted successfully")
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав для удаления товара"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Товар с указанным ID не найден"
        )
    })
    public String deleteProduct(
        @Parameter(hidden = true)
        @AuthenticationPrincipal LocalUser user,

        @Parameter(description = "ID товара для удаления", required = true, example = "1")
        @PathVariable Long id) {

        productService.deleteProduct(user, id);
        return "Product deleted successfully";
    }
}
package com.ecommercebackend.api.controller.description;

import com.ecommercebackend.api.model.DescriptionBody;
import com.ecommercebackend.api.model.DescriptionResponse;
import com.ecommercebackend.model.Description;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.service.DescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling product description operations.
 */
@RestController
@RequestMapping("/description")
@AllArgsConstructor
@Tag(name = "Описание товаров", description = "API для управления техническими описаниями товаров")
public class DescriptionController {

    private final DescriptionService descriptionService;

    /**
     * Create a new description for a product.
     */
    @PostMapping("/product/{productId}")
    @Operation(
        summary = "Создать описание для товара",
        description = "Создает новое техническое описание для указанного товара. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Описание успешно создано",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные запроса"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Требуется аутентификация"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Описание для этого товара уже существует"
        )
    })
    public ResponseEntity<DescriptionResponse> createDescription(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Данные для создания описания",
                required = true,
                content = @Content(schema = @Schema(implementation = DescriptionBody.class))
            )
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.createDescription(descriptionBody, productId, user);
        DescriptionResponse response = convertToResponse(description);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get description by product ID.
     */
    @GetMapping("/product/{productId}")
    @Operation(
        summary = "Получить описание по ID товара",
        description = "Возвращает техническое описание для указанного товара"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание найдено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Описание для товара не найдено"
        )
    })
    public ResponseEntity<DescriptionResponse> getDescriptionByProductId(
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId) {

        Description description = descriptionService.getDescriptionByProductId(productId);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Get description by its ID.
     */
    @GetMapping("/{descriptionId}")
    @Operation(
        summary = "Получить описание по его ID",
        description = "Возвращает техническое описание по его уникальному идентификатору"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание найдено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Описание не найдено"
        )
    })
    public ResponseEntity<DescriptionResponse> getDescriptionById(
            @Parameter(description = "ID описания", required = true, example = "1")
            @PathVariable Long descriptionId) {

        Description description = descriptionService.getDescriptionById(descriptionId);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing description.
     */
    @PutMapping("/{descriptionId}")
    @Operation(
        summary = "Обновить существующее описание",
        description = "Полностью обновляет техническое описание по его ID. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание успешно обновлено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные запроса"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Требуется аутентификация"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Описание не найдено"
        )
    })
    public ResponseEntity<DescriptionResponse> updateDescription(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID описания", required = true, example = "1")
            @PathVariable Long descriptionId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Новые данные описания",
                required = true,
                content = @Content(schema = @Schema(implementation = DescriptionBody.class))
            )
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.updateDescription(descriptionId, descriptionBody, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Update description by product ID.
     */
    @PutMapping("/product/{productId}")
    @Operation(
        summary = "Обновить описание по ID товара",
        description = "Полностью обновляет техническое описание для указанного товара. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание успешно обновлено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные запроса"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Требуется аутентификация"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Товар или описание не найдено"
        )
    })
    public ResponseEntity<DescriptionResponse> updateDescriptionByProductId(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Новые данные описания",
                required = true,
                content = @Content(schema = @Schema(implementation = DescriptionBody.class))
            )
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.updateDescriptionByProductId(productId, descriptionBody, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Create or update description for a product.
     */
    @PatchMapping("/product/{productId}")
    @Operation(
        summary = "Создать или обновить описание для товара",
        description = "Создает новое описание, если его нет, или частично обновляет существующее. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание успешно создано или обновлено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные запроса"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Требуется аутентификация"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Недостаточно прав"
        )
    })
    public ResponseEntity<DescriptionResponse> createOrUpdateDescription(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Данные для создания или обновления описания",
                required = true,
                content = @Content(schema = @Schema(implementation = DescriptionBody.class))
            )
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.createOrUpdateDescription(descriptionBody, productId, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete description by its ID.
     */
    @DeleteMapping("/{descriptionId}")
    @Operation(
        summary = "Удалить описание по его ID",
        description = "Удаляет техническое описание по его уникальному идентификатору. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Описание успешно удалено"),
        @ApiResponse(responseCode = "401", description = "Требуется аутентификация"),
        @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
        @ApiResponse(responseCode = "404", description = "Описание не найдено")
    })
    public ResponseEntity<Void> deleteDescription(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID описания", required = true, example = "1")
            @PathVariable Long descriptionId) {

        descriptionService.deleteDescription(descriptionId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete description by product ID.
     */
    @DeleteMapping("/product/{productId}")
    @Operation(
        summary = "Удалить описание по ID товара",
        description = "Удаляет техническое описание для указанного товара. Требуется аутентификация."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Описание успешно удалено"),
        @ApiResponse(responseCode = "401", description = "Требуется аутентификация"),
        @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
        @ApiResponse(responseCode = "404", description = "Товар или описание не найдено")
    })
    public ResponseEntity<Void> deleteDescriptionByProductId(
            @Parameter(hidden = true) @AuthenticationPrincipal LocalUser user,
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId) {

        descriptionService.deleteDescriptionByProductId(productId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if description exists for product.
     */
    @GetMapping("/product/{productId}/exists")
    @Operation(
        summary = "Проверить наличие описания для товара",
        description = "Проверяет, существует ли техническое описание для указанного товара"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Результат проверки",
            content = @Content(schema = @Schema(type = "boolean", example = "true"))
        )
    })
    public ResponseEntity<Boolean> checkDescriptionExists(
            @Parameter(description = "ID товара", required = true, example = "123")
            @PathVariable Long productId) {

        boolean exists = descriptionService.descriptionExistsForProduct(productId);
        return ResponseEntity.ok(exists);
    }

    /**
     * Get description by article SKU.
     */
    @GetMapping("/sku/{articleSku}")
    @Operation(
        summary = "Получить описание по артикулу (SKU)",
        description = "Возвращает техническое описание по артикулу товара"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Описание найдено",
            content = @Content(schema = @Schema(implementation = DescriptionResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Описание по данному артикулу не найдено"
        )
    })
    public ResponseEntity<DescriptionResponse> getDescriptionByArticleSku(
            @Parameter(description = "Артикул товара (SKU)", required = true, example = "SM-S918BZKGSEK")
            @PathVariable String articleSku) {

        Description description = descriptionService.getDescriptionByArticleSku(articleSku);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Convert Description entity to DescriptionResponse DTO.
     */
    private DescriptionResponse convertToResponse(Description description) {
        if (description == null) {
            return null;
        }

        DescriptionResponse response = new DescriptionResponse();
        response.setId(description.getId());

        if (description.getProduct() != null) {
            response.setProductId(description.getProduct().getId());
            response.setProductName(description.getProduct().getName());
        }

        response.setModel(description.getModel());
        response.setArticleSku(description.getArticleSku());
        response.setDimensions(description.getDimensions());
        response.setWeight(description.getWeight());
        response.setColorFinish(description.getColorFinish());
        response.setPowerConsumption(description.getPowerConsumption());
        response.setCapacity(description.getCapacity());
        response.setMaterials(description.getMaterials());
        response.setWarranty(description.getWarranty());
        response.setCountryOfOrigin(description.getCountryOfOrigin());
        return response;
    }
}
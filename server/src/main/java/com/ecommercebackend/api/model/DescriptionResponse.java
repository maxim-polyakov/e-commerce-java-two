package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Ответ с детальным описанием товара")
public class DescriptionResponse {

    @Schema(description = "ID описания в базе данных", example = "1")
    private Long id;

    @Schema(description = "ID товара", example = "123", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @Schema(description = "Название товара", example = "Смартфон Samsung Galaxy S23 Ultra", requiredMode = Schema.RequiredMode.REQUIRED)
    private String productName;

    @Schema(description = "Модель товара", example = "Galaxy S23 Ultra")
    private String model;

    @Schema(description = "Артикул/SKU товара", example = "SM-S918BZKGSEK")
    private String articleSku;

    @Schema(description = "Габаритные размеры", example = "163.4 × 78.1 × 8.9 мм")
    private String dimensions;

    @Schema(description = "Вес товара", example = "233 г")
    private String weight;

    @Schema(description = "Цвет и отделка", example = "Черный, матовое стекло")
    private String colorFinish;

    @Schema(description = "Потребляемая мощность", example = "5000 мАч, 45 Вт")
    private String powerConsumption;

    @Schema(description = "Вместимость/объем", example = "12 ГБ ОЗУ, 256 ГБ ПЗУ")
    private String capacity;

    @Schema(description = "Материалы изготовления", example = "Алюминий, стекло Gorilla Glass Victus 2")
    private String materials;

    @Schema(description = "Гарантийный срок", example = "24 месяца")
    private String warranty;

    @Schema(description = "Страна производитель", example = "Вьетнам")
    private String countryOfOrigin;
}
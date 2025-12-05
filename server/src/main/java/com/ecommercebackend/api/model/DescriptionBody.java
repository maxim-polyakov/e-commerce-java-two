package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Тело запроса для добавления/обновления описания товара")
public class DescriptionBody {

    @Schema(description = "Модель товара", example = "Galaxy S23 Ultra", maxLength = 100)
    private String model;

    @Schema(description = "Артикул/SKU товара", example = "SM-S918BZKGSEK", maxLength = 50)
    private String articleSku;

    @Schema(description = "Габаритные размеры", example = "163.4 × 78.1 × 8.9 мм", maxLength = 100)
    private String dimensions;

    @Schema(description = "Вес товара", example = "233 г", maxLength = 50)
    private String weight;

    @Schema(description = "Цвет и отделка", example = "Черный, матовое стекло", maxLength = 100)
    private String colorFinish;

    @Schema(description = "Потребляемая мощность", example = "5000 мАч, 45 Вт", maxLength = 100)
    private String powerConsumption;

    @Schema(description = "Вместимость/объем", example = "12 ГБ ОЗУ, 256 ГБ ПЗУ", maxLength = 100)
    private String capacity;

    @Schema(description = "Материалы изготовления", example = "Алюминий, стекло Gorilla Glass Victus 2", maxLength = 200)
    private String materials;

    @Schema(description = "Гарантийный срок", example = "24 месяца", maxLength = 50)
    private String warranty;

    @Schema(description = "Страна производитель", example = "Вьетнам", maxLength = 100)
    private String countryOfOrigin;
}
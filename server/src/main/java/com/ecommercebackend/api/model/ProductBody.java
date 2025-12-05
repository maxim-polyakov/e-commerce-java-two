package com.ecommercebackend.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "Тело запроса для создания или обновления товара")
public class ProductBody {

    @Schema(
        description = "Изображение товара",
        type = "string",
        format = "binary",
        example = "image.jpg"
    )
    private MultipartFile image;

    @Schema(
        description = "Название файла изображения (альтернатива загрузке файла)",
        example = "product_image_123.jpg",
        nullable = true
    )
    private String imageName;

    @Schema(
        description = "Название товара",
        example = "Смартфон Samsung Galaxy S23",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;

    @Schema(
        description = "Краткое описание товара",
        example = "Флагманский смартфон с камерой 200 МП",
        maxLength = 255
    )
    private String shortDescription;

    @Schema(
        description = "Полное описание товара с характеристиками",
        example = "Смартфон Samsung Galaxy S23 с дисплеем 6.1 дюйма, процессором Snapdragon 8 Gen 2 и камерой 200 МП. 8 ГБ ОЗУ, 256 ГБ памяти."
    )
    private String longDescription;

    @Schema(
        description = "Цена товара",
        example = "89999.99",
        minimum = "0.0",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Double price;

    @Schema(
        description = "Рейтинг товара (от 0 до 5)",
        example = "4.5",
        minimum = "0.0",
        maximum = "5.0",
        nullable = true
    )
    private Double raiting;

    @Schema(
        description = "Количество товара на складе",
        example = "50",
        minimum = "0",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Integer quantity;
}
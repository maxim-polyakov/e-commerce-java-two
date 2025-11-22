package com.ecommercebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Technical specifications and detailed description of a product.
 */
@Entity
@Table(name = "product_description")
@Getter
@Setter
public class Description {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // Основные идентификаторы
    @Column(name = "model", nullable = true)
    private String model;

    @Column(name = "article_sku", nullable = true, unique = true)
    private String articleSku;

    // Габариты и вес
    @Column(name = "dimensions")
    private String dimensions; // Формат "В×Ш×Г" например "178×60×63 см"

    @Column(name = "weight")
    private String weight; // Например "68 кг"

    // Внешний вид
    @Column(name = "color_finish")
    private String colorFinish;

    // Технические характеристики
    @Column(name = "power_consumption")
    private String powerConsumption;

    @Column(name = "capacity")
    private String capacity;

    // Материалы
    @Column(name = "materials", length = 1000)
    private String materials;

    // Дополнительные технические поля
    @Column(name = "warranty")
    private String warranty;

    @Column(name = "country_of_origin")
    private String countryOfOrigin;

    // Связь с Product (владелец связи)
    @OneToOne
    @JoinColumn(name = "product_id", nullable = true, unique = true)
    @JsonIgnore
    private Product product;

    @Column(name = "deleted", nullable = true)
    private boolean deleted = false;
}
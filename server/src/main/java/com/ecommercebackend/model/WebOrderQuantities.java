package com.ecommercebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * The quantity ordered of a product.
 */
@Entity
@Table(name = "web_order_quantities")
@Getter
@Setter
public class WebOrderQuantities {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;

    // Связь с заказом
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private WebOrder order;

    // Связь с товаром - теперь может быть NULL!
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // ЗАМОРОЖЕННЫЕ ДАННЫЕ ТОВАРА (заполняются при удалении товара)
    @Column(name = "frozen_product_name")
    private String frozenProductName;

    @Column(name = "frozen_product_price")
    private Double frozenProductPrice;

    @Column(name = "frozen_product_image")
    private String frozenProductImage;

    @Column(name = "frozen_product_sku")
    private String frozenProductSku;

    /**
     * Получить название товара для отображения (использует замороженные данные если товар удален)
     */
    @Transient
    public String getDisplayProductName() {
        if (product == null) {
            return frozenProductName != null ?
                frozenProductName + " (товар удален)" : "Товар удален";
        }
        return product.getName();
    }

    /**
     * Получить цену для отображения
     */
    @Transient
    public Double getDisplayPrice() {
        if (product == null) {
            return frozenProductPrice;
        }
        return product.getPrice();
    }

    /**
     * Заморозить данные текущего товара
     */
    public void freezeProductData() {
        if (this.product != null) {
            this.frozenProductName = this.product.getName();
            this.frozenProductPrice = this.product.getPrice();
            this.frozenProductImage = this.product.getImage();
        }
    }
}
package com.ecommercebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * A product available for purchasing.
 */
@Entity
@Table(name = "product")
@Getter
@Setter
@SQLDelete(sql = "UPDATE product SET deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted = false")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "short_description", nullable = false)
    private String shortDescription;

    @Column(name = "long_description")
    private String longDescription;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "raiting", nullable = false)
    private Double raiting = 0.0;

    @Column(name = "image", nullable = false)
    private String image;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    // Новая связь с Description
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Description description;

    // Поля для Soft Delete
    @Column(name = "deleted", nullable = true)
    private Boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_reason")
    private String deletedReason;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<WebOrderQuantities> orderQuantities = new ArrayList<>();

    /**
     * Мягкое удаление продукта
     */
    public void softDelete(String reason) {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
        this.deletedReason = reason;
    }

    /**
     * Мягкое удаление продукта (без указания причины)
     */
    public void softDelete() {
        this.softDelete("Удалено администратором");
    }

    /**
     * Восстановление продукта
     */
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedReason = null;
    }

    /**
     * Проверить, удален ли продукт
     */
    public boolean isDeleted() {
        return Boolean.TRUE.equals(this.deleted);
    }

    /**
     * Получить отображаемое имя продукта
     */
    @Transient
    public String getDisplayName() {
        if (this.isDeleted()) {
            return this.name + " (удален)";
        }
        return this.name;
    }
}
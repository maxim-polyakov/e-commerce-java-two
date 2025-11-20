package com.ecommercebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * A product available for purchasing.
 */
@Entity
@Table(name = "product")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "short_description", nullable = false)
    private String shortDescription;

    @Column(name = "long_description")
    private String longDescription;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "raiting", nullable = false)
    private Double raiting;

    @Column(name = "image", nullable = false)
    private String image;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    // Новая связь с Description
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Description description;
}
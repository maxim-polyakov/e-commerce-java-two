package com.ecommercebackend.api.model;
import lombok.Data;


@Data
public class ProductBody {
    private String image;
    private String imageName;
    private String name;
    private String shortDescription;
    private String longDescription;
    private Double price;
    private Double raiting;
    private Integer quantity;
}

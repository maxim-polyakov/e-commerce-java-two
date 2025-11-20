package com.ecommercebackend.api.model;

import lombok.Data;

@Data
public class DescriptionResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String model;
    private String articleSku;
    private String dimensions;
    private String weight;
    private String colorFinish;
    private String powerConsumption;
    private String capacity;
    private String materials;
    private String warranty;
    private String countryOfOrigin;
}
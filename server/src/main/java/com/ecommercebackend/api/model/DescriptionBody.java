package com.ecommercebackend.api.model;

import lombok.Data;

@Data
public class DescriptionBody {
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
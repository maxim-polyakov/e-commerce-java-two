package com.ecommercebackend.api.model;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductBody {
    private MultipartFile image;
    private String imageName;
    private String name;
    private String shortDescription;
    private String longDescription;
    private Double price;
    private Double raiting;
    private Integer quantity;
}

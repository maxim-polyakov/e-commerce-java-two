package com.ecommercebackend.api.controller.product;

import com.ecommercebackend.model.Product;
import com.ecommercebackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Controller to handle the creation, updating & viewing of products.
 */
@RestController
@RequestMapping("/product")
public class ProductController {

  /** The Product Service. */
  @Autowired
  private ProductService productService;

  @GetMapping
  public List<Product> getProducts(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {
    return productService.getProducts(page, size).getContent();
  }


}

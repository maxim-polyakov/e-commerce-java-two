package com.ecommercebackend.api.controller.product;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.api.model.ProductBody;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

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
  public Page<Product> getProducts(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {
    return productService.getProducts(page, size);
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Product createProduct(
    @AuthenticationPrincipal LocalUser user,
    @ModelAttribute ProductBody productData) {
    return productService.createProduct(user,productData);
  }

  @DeleteMapping("/{id}")
  public String deleteProduct(
        @AuthenticationPrincipal LocalUser user,
        @PathVariable Long id) {
    productService.deleteProduct(user, id);
    return "Product deleted successfully";
  }
}

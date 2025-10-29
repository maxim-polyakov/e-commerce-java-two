package com.ecommercebackend.service;

import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.dao.ProductDAO;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for handling product actions.
 */
@Service
@AllArgsConstructor
public class ProductService {

  private final ProductDAO productDAO;

  public Page<Product> getProducts(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return productDAO.findAll(pageable);
  }
}
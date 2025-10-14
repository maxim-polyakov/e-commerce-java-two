package com.youtube.tutorial.ecommercebackend.service;

import com.youtube.tutorial.ecommercebackend.model.Product;
import com.youtube.tutorial.ecommercebackend.model.dao.ProductDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for handling product actions.
 */
@Service
public class ProductService {

  @Autowired
  private ProductDAO productDAO;

  public List<Product> getProducts() {
    return productDAO.findAll();
  }

}

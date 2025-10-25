package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data Access Object for accessing Product data.
 */
@Repository
public interface ProductDAO extends JpaRepository<Product, Long> {
}

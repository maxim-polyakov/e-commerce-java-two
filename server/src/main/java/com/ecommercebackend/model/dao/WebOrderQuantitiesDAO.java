package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.WebOrderQuantities;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for accessing WebOrderQuantities data.
 */
@Repository
public interface WebOrderQuantitiesDAO extends JpaRepository<WebOrderQuantities, Long> {

    @Query("SELECT COUNT(woq) FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    // Найти все позиции заказов для товара
    @Query("SELECT woq FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    List<WebOrderQuantities> findAllByProductId(@Param("productId") Long productId);

}
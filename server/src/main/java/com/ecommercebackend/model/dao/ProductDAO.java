package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.WebOrderQuantities;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for accessing Product data.
 */
@Repository
public interface ProductDAO extends JpaRepository<Product, Long> {

    boolean existsByNameAndDeletedFalse(String name);

    @Query("SELECT p FROM Product p WHERE p.deleted = true")
    Page<Product> findAllDeleted(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);


    @Query("SELECT p FROM Product p WHERE p.deleted = false AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);


    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);

    @Query("SELECT " +
           "COUNT(p) as total, " +
           "SUM(CASE WHEN p.deleted = true THEN 1 ELSE 0 END) as deleted, " +
           "AVG(p.price) as avgPrice, " +
           "MAX(p.price) as maxPrice, " +
           "MIN(p.price) as minPrice " +
           "FROM Product p")
    Object[] getProductStatistics();

    @Modifying
    @Query(nativeQuery = true,
           value = "DELETE FROM product WHERE id = :productId")
    void hardDelete(@Param("productId") Long productId);

     @Query("SELECT woq FROM WebOrderQuantities woq WHERE woq.product.id = :productId OR woq.frozenProductSku IS NOT NULL")
    List<WebOrderQuantities> findAllOrderQuantitiesForProduct(@Param("productId") Long productId);
}
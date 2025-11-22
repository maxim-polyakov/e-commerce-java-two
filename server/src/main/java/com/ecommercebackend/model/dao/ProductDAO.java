package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.Product;
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

    /**
     * Проверить существование продукта по имени (только активные)
     */
    boolean existsByName(String name);

    /**
     * Проверить существование продукта по имени включая удаленные
     */
    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.name = :name")
    boolean existsByNameIncludingDeleted(@Param("name") String name);

    /**
     * Найти все активные продукты (не удаленные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false")
    List<Product> findAllActive();

    /**
     * Найти все активные продукты с пагинацией
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false")
    Page<Product> findAllActive(Pageable pageable);

    /**
     * Найти все удаленные продукты
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = true")
    List<Product> findAllDeleted();

    /**
     * Найти все удаленные продукты с пагинацией
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = true")
    Page<Product> findAllDeleted(Pageable pageable);

    /**
     * Найти продукт по ID включая удаленные
     */
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);

    /**
     * Найти продукты по названию (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Найти продукты по названию с пагинацией (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    /**
     * Найти продукты по диапазону цен (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    /**
     * Найти продукты по диапазону цен с пагинацией (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);

    /**
     * Подсчитать количество активных продуктов
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.deleted = false")
    long countActive();

    /**
     * Подсчитать количество удаленных продуктов
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.deleted = true")
    long countDeleted();

    /**
     * Мягкое удаление продукта по ID
     */
    @Modifying
    @Query("UPDATE Product p SET p.deleted = true, p.deletedAt = CURRENT_TIMESTAMP, p.deletedReason = :reason WHERE p.id = :id")
    void softDeleteById(@Param("id") Long id, @Param("reason") String reason);

    /**
     * Мягкое удаление продукта по ID (без указания причины)
     */
    @Modifying
    @Query("UPDATE Product p SET p.deleted = true, p.deletedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void softDeleteById(@Param("id") Long id);

    /**
     * Восстановить удаленный продукт
     */
    @Modifying
    @Query("UPDATE Product p SET p.deleted = false, p.deletedAt = null, p.deletedReason = null WHERE p.id = :id")
    void restoreById(@Param("id") Long id);

    /**
     * Получить продукты с рейтингом выше указанного (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.raiting >= :minRating")
    List<Product> findByRaitingGreaterThanEqual(@Param("minRating") Double minRating);

    /**
     * Получить продукты отсортированные по рейтингу (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false ORDER BY p.raiting DESC")
    List<Product> findAllByOrderByRaitingDesc();

    /**
     * Получить продукты отсортированные по цене (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false ORDER BY p.price ASC")
    List<Product> findAllByOrderByPriceAsc();

    /**
     * Получить продукты отсортированные по дате создания (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false ORDER BY p.id DESC")
    List<Product> findAllByOrderByIdDesc();

    /**
     * Найти продукты по нескольким ID (только активные)
     */
    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.id IN :ids")
    List<Product> findByIdIn(@Param("ids") List<Long> ids);

    /**
     * Получить статистику по продуктам
     */
    @Query("SELECT " +
           "COUNT(p) as total, " +
           "SUM(CASE WHEN p.deleted = true THEN 1 ELSE 0 END) as deleted, " +
           "AVG(p.price) as avgPrice, " +
           "MAX(p.price) as maxPrice, " +
           "MIN(p.price) as minPrice " +
           "FROM Product p")
    Object[] getProductStatistics();
}
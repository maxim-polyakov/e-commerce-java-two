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

    /**
     * Найти все позиции заказа
     */
    List<WebOrderQuantities> findByOrder(WebOrder order);

    /**
     * Найти все позиции заказа по ID заказа
     */
    List<WebOrderQuantities> findByOrderId(Long orderId);

    /**
     * Найти все позиции заказа по ID заказа с пагинацией
     */
    Page<WebOrderQuantities> findByOrderId(Long orderId, Pageable pageable);

    /**
     * Найти все заказы с определенным продуктом
     */
    List<WebOrderQuantities> findByProductId(Long productId);

    /**
     * Найти все заказы с определенным продуктом с пагинацией
     */
    Page<WebOrderQuantities> findByProductId(Long productId, Pageable pageable);

    /**
     * Проверить существование заказов с данным продуктом
     */
    boolean existsByProductId(Long productId);

    /**
     * Подсчитать количество заказов с продуктом
     */
    @Query("SELECT COUNT(woq) FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    /**
     * Подсчитать количество позиций в заказе
     */
    Long countByOrderId(Long orderId);

    /**
     * Получить общее количество проданного продукта
     */
    @Query("SELECT SUM(woq.quantity) FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    Long getTotalQuantitySold(@Param("productId") Long productId);

    /**
     * Получить общую выручку по продукту
     */
    @Query("SELECT SUM(woq.quantity * woq.productPrice) FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    Double getTotalRevenueByProduct(@Param("productId") Long productId);

    /**
     * Обнулить ссылку на продукт (для денормализации)
     * Используется когда продукт удаляется, но данные о нем сохранены
     */
    @Modifying
    @Query("UPDATE WebOrderQuantities woq SET woq.product = null WHERE woq.product.id = :productId")
    void nullifyProductReference(@Param("productId") Long productId);

    /**
     * Удалить все позиции заказа
     */
    @Modifying
    void deleteByOrderId(Long orderId);

    /**
     * Удалить позиции заказа по ID продукта
     */
    @Modifying
    void deleteByProductId(Long productId);

    /**
     * Найти позицию продукта в конкретном заказе
     */
    @Query("SELECT woq FROM WebOrderQuantities woq WHERE woq.order.id = :orderId AND woq.product.id = :productId")
    Optional<WebOrderQuantities> findByOrderIdAndProductId(@Param("orderId") Long orderId, @Param("productId") Long productId);

    /**
     * Получить самые популярные продукты (по количеству продаж)
     */
    @Query("SELECT woq.product.id, woq.productName, SUM(woq.quantity) as totalQuantity, " +
           "SUM(woq.quantity * woq.productPrice) as totalRevenue " +
           "FROM WebOrderQuantities woq " +
           "WHERE woq.product IS NOT NULL " +
           "GROUP BY woq.product.id, woq.productName " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findMostPopularProducts();

    /**
     * Получить самые популярные продукты с пагинацией
     */
    @Query("SELECT woq.product.id, woq.productName, SUM(woq.quantity) as totalQuantity, " +
           "SUM(woq.quantity * woq.productPrice) as totalRevenue " +
           "FROM WebOrderQuantities woq " +
           "WHERE woq.product IS NOT NULL " +
           "GROUP BY woq.product.id, woq.productName " +
           "ORDER BY totalQuantity DESC")
    Page<Object[]> findMostPopularProducts(Pageable pageable);

    /**
     * Получить статистику по продукту
     */
    @Query("SELECT " +
           "COUNT(DISTINCT woq.order.id) as orderCount, " +
           "SUM(woq.quantity) as totalQuantity, " +
           "AVG(woq.quantity) as avgQuantity, " +
           "SUM(woq.quantity * woq.productPrice) as totalRevenue " +
           "FROM WebOrderQuantities woq " +
           "WHERE woq.product.id = :productId")
    Object[] getProductStatistics(@Param("productId") Long productId);

    /**
     * Получить общую выручку по всем заказам
     */
    @Query("SELECT SUM(woq.quantity * woq.productPrice) FROM WebOrderQuantities woq")
    Double getTotalRevenue();

    /**
     * Получить общее количество проданных товаров
     */
    @Query("SELECT SUM(woq.quantity) FROM WebOrderQuantities woq")
    Long getTotalItemsSold();

    /**
     * Найти заказы пользователя с определенным продуктом
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.order.user.id = :userId AND woq.product.id = :productId")
    List<WebOrderQuantities> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    /**
     * Получить историю покупок пользователя
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.order.user.id = :userId " +
           "ORDER BY woq.order.id DESC")
    List<WebOrderQuantities> findUserPurchaseHistory(@Param("userId") Long userId);

    /**
     * Получить историю покупок пользователя с пагинацией
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.order.user.id = :userId " +
           "ORDER BY woq.order.id DESC")
    Page<WebOrderQuantities> findUserPurchaseHistory(@Param("userId") Long userId, Pageable pageable);

    /**
     * Найти позиции заказа с денормализованными продуктами (продукты удалены)
     */
    @Query("SELECT woq FROM WebOrderQuantities woq WHERE woq.product IS NULL")
    List<WebOrderQuantities> findWithNullProduct();

    /**
     * Найти позиции заказа с денормализованными продуктами с пагинацией
     */
    @Query("SELECT woq FROM WebOrderQuantities woq WHERE woq.product IS NULL")
    Page<WebOrderQuantities> findWithNullProduct(Pageable pageable);

    /**
     * Получить топ продуктов по выручке
     */
    @Query("SELECT woq.product.id, woq.productName, " +
           "SUM(woq.quantity * woq.productPrice) as totalRevenue, " +
           "SUM(woq.quantity) as totalQuantity " +
           "FROM WebOrderQuantities woq " +
           "WHERE woq.product IS NOT NULL " +
           "GROUP BY woq.product.id, woq.productName " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopProductsByRevenue();

    /**
     * Получить топ продуктов по выручке с пагинацией
     */
    @Query("SELECT woq.product.id, woq.productName, " +
           "SUM(woq.quantity * woq.productPrice) as totalRevenue, " +
           "SUM(woq.quantity) as totalQuantity " +
           "FROM WebOrderQuantities woq " +
           "WHERE woq.product IS NOT NULL " +
           "GROUP BY woq.product.id, woq.productName " +
           "ORDER BY totalRevenue DESC")
    Page<Object[]> findTopProductsByRevenue(Pageable pageable);

    /**
     * Получить средний чек
     */
    @Query("SELECT AVG(orderTotal.total) FROM (" +
           "SELECT SUM(woq.quantity * woq.productPrice) as total " +
           "FROM WebOrderQuantities woq " +
           "GROUP BY woq.order.id" +
           ") orderTotal")
    Double getAverageOrderValue();

    /**
     * Получить количество уникальных покупателей продукта
     */
    @Query("SELECT COUNT(DISTINCT woq.order.user.id) FROM WebOrderQuantities woq WHERE woq.product.id = :productId")
    Long countUniqueCustomersByProduct(@Param("productId") Long productId);

    /**
     * Получить последние продажи продукта
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.product.id = :productId " +
           "ORDER BY woq.order.id DESC")
    List<WebOrderQuantities> findRecentSalesByProduct(@Param("productId") Long productId);

    /**
     * Получить последние продажи продукта с пагинацией
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.product.id = :productId " +
           "ORDER BY woq.order.id DESC")
    Page<WebOrderQuantities> findRecentSalesByProduct(@Param("productId") Long productId, Pageable pageable);

    /**
     * Проверить, покупал ли пользователь определенный продукт
     */
    @Query("SELECT COUNT(woq) > 0 FROM WebOrderQuantities woq " +
           "WHERE woq.order.user.id = :userId AND woq.product.id = :productId")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    /**
     * Получить общее количество заказов пользователя
     */
    @Query("SELECT COUNT(DISTINCT woq.order.id) FROM WebOrderQuantities woq WHERE woq.order.user.id = :userId")
    Long countUserOrders(@Param("userId") Long userId);

    /**
     * Получить общую сумму покупок пользователя
     */
    @Query("SELECT SUM(woq.quantity * woq.productPrice) FROM WebOrderQuantities woq WHERE woq.order.user.id = :userId")
    Double getUserTotalSpent(@Param("userId") Long userId);

    /**
     * Найти дубликаты позиций в заказе (одинаковый продукт)
     */
    @Query("SELECT woq FROM WebOrderQuantities woq " +
           "WHERE woq.order.id = :orderId " +
           "GROUP BY woq.product.id " +
           "HAVING COUNT(woq.id) > 1")
    List<WebOrderQuantities> findDuplicateItemsInOrder(@Param("orderId") Long orderId);

    /**
     * Обновить количество товара в позиции заказа
     */
    @Modifying
    @Query("UPDATE WebOrderQuantities woq SET woq.quantity = :quantity WHERE woq.id = :id")
    void updateQuantity(@Param("id") Long id, @Param("quantity") Integer quantity);

    /**
     * Получить позиции заказа с количеством больше указанного
     */
    List<WebOrderQuantities> findByQuantityGreaterThan(Integer quantity);

    /**
     * Получить позиции заказа с количеством меньше указанного
     */
    List<WebOrderQuantities> findByQuantityLessThan(Integer quantity);

    /**
     * Получить позиции заказа в диапазоне количества
     */
    List<WebOrderQuantities> findByQuantityBetween(Integer minQuantity, Integer maxQuantity);
}
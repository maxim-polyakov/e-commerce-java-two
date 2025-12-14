package com.ecommercebackend.service;

import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.WebOrderQuantities;
import com.ecommercebackend.model.dao.ProductDAO;
import com.ecommercebackend.model.dao.WebOrderQuantitiesDAO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductDeletionService {

    private final ProductDAO productDAO;
    private final WebOrderQuantitiesDAO webOrderQuantitiesDAO;

    /**
     * 1. Обычное мягкое удаление (для UI/админки)
     */
    @Transactional
    public void softDeleteProduct(Long productId, String reason) {
        Product product = productDAO.findById(productId)
            .orElseThrow(() -> new RuntimeException("Товар не найден"));
        product.softDelete(reason);
        productDAO.save(product);
        log.info("Товар {} помечен как удаленный. Причина: {}", productId, reason);
    }

    /**
     * 2. ФИЗИЧЕСКОЕ УДАЛЕНИЕ с сохранением истории заказов
     * Используйте ТОЛЬКО через админку или скрипты!
     */
    @Transactional
    public void hardDeleteProductWithHistory(Long productId) {
        log.info("Начато физическое удаление товара {}", productId);

        // 1. Найти товар (даже если он уже помечен deleted)
        Product product = productDAO.findByIdIncludingDeleted(productId)
            .orElseThrow(() -> new RuntimeException("Товар не найден"));

        // 2. Найти все заказы с этим товаром
        List<WebOrderQuantities> orderItems = webOrderQuantitiesDAO
            .findAllByProductId(productId);

        if (orderItems.isEmpty()) {
            // Если заказов нет - просто удаляем
            productDAO.delete(product);
            log.info("Товар {} удален (не было заказов)", productId);
            return;
        }

        // 3. ЕСТЬ ЗАКАЗЫ: сохраняем данные и разрываем связи
        log.info("Найдено {} заказов с товаром {}. Сохраняем историю...",
                 orderItems.size(), productId);

        for (WebOrderQuantities item : orderItems) {
            // Замораживаем данные товара
            item.setFrozenProductName(product.getName());
            item.setFrozenProductPrice(product.getPrice());
            item.setFrozenProductImage(product.getImage());

            item.setProduct(null);

            webOrderQuantitiesDAO.save(item);
        }

        // 4. Теперь можно физически удалить товар
        productDAO.delete(product);

        log.info("ТОВАР {} УДАЛЕН. Данные сохранены в {} заказах",
                 productId, orderItems.size());
    }

    /**
     * 3. Пакетное удаление устаревших товаров (например, через cron)
     */
    @Transactional
    public int batchDeleteOldProducts(int daysOld) {
        // Найти товары, помеченные как deleted более N дней назад
        List<Product> oldProducts = productDAO.findAll()
            .stream()
            .filter(p -> p.isDeleted() &&
                        p.getDeletedAt() != null &&
                        p.getDeletedAt().isBefore(
                            LocalDateTime.now().minusDays(daysOld)))
            .toList();

        int deletedCount = 0;
        for (Product product : oldProducts) {
            try {
                hardDeleteProductWithHistory(product.getId());
                deletedCount++;
            } catch (Exception e) {
                log.error("Ошибка удаления товара {}: {}", product.getId(), e.getMessage());
            }
        }

        log.info("Пакетное удаление: удалено {} старых товаров", deletedCount);
        return deletedCount;
    }
}
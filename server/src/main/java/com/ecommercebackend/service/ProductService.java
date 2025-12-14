package com.ecommercebackend.service;

import com.ecommercebackend.config.UploadConfig;
import com.ecommercebackend.api.model.ProductBody;
import com.ecommercebackend.model.Inventory;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.Description;
import com.ecommercebackend.model.dao.ProductDAO;
import com.ecommercebackend.model.dao.WebOrderQuantitiesDAO;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.ecommercebackend.model.LocalUser;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for handling product actions.
 */
@Service
@AllArgsConstructor
public class ProductService {

    private final ProductDAO productDAO;

    private final WebOrderQuantitiesDAO orderQuantitiesDAO;

    private final UploadConfig uploadConfig;

    private final ProductDeletionService productDeletionService;

    private final YandexStorageService storageService;

    // ДОБАВЬТЕ ЭТОТ МЕТОД ДЛЯ ПОЛУЧЕНИЯ ТОВАРА ПО ID
    public Product getProductById(Long id) {
        Optional<Product> product = productDAO.findById(id);
        if (product.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product.get();
    }

    public Product getProductByIdIncludingDeleted(Long id) {
        Optional<Product> product = productDAO.findByIdIncludingDeleted(id);
        if (product.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product.get();
    }

    /**
     * Сохраняет изображение в S3 вместо локальной файловой системы
     */
    public String saveMultipartImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        try {
            // Загружаем изображение в S3
            // Префикс "products" создаст виртуальную папку в бакете
            String s3Key = storageService.uploadImage(imageFile, "products");

            // Возвращаем ключ S3 для хранения в БД
            return s3Key;

        } catch (IOException e) {
            throw new RuntimeException("Ошибка сохранения изображения в S3: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "png"; // расширение по умолчанию
        }
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex + 1);
        }
        return "png"; // расширение по умолчанию
    }

    @Transactional
    public Product createProduct(LocalUser user, ProductBody productBody) {
        try {
            if (!user.getRole().getValue().equals("ADMIN")) {
                throw new RuntimeException("Недостаточно прав для создания продукта");
            }

            if (productDAO.existsByNameAndDeletedFalse(productBody.getName())) {
                throw new RuntimeException("Активный продукт с именем '" + productBody.getName() + "' уже существует");
            }

            String s3ImageKey = null;
            if (productBody.getImage() != null && !productBody.getImage().isEmpty()) {
                s3ImageKey = this.saveMultipartImage(productBody.getImage());
            }

            // Создаем продукт
            Product product = new Product();
            product.setName(productBody.getName());
            product.setShortDescription(productBody.getShortDescription());
            product.setLongDescription(productBody.getLongDescription());
            product.setPrice(productBody.getPrice());
            product.setRaiting(productBody.getRaiting() != null ? productBody.getRaiting() : 0.0);
            product.setImage(s3ImageKey); // Теперь храним ключ S3
            product.setDeleted(false);

            // Создаем инвентарь
            Inventory inventory = new Inventory();
            inventory.setProduct(product);
            inventory.setQuantity(productBody.getQuantity() != null ? productBody.getQuantity() : 0);
            inventory.setDeleted(false);

            // Создаем описание (если нужно)
            Description description = new Description();
            description.setProduct(product);
            description.setDeleted(false);

            // Устанавливаем связи
            product.setInventory(inventory);
            product.setDescription(description);

            return productDAO.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания продукта: " + e.getMessage(), e);
        }
    }

    public Page<Product> getProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findAll(pageable);
    }

    public Page<Product> getAllProductsIncludingDeleted(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findAll(pageable);
    }

    /**
     * Получить список удаленных продуктов с пагинацией
     */
    public Page<Product> getDeletedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findAllDeleted(pageable);
    }

    @Transactional
    public void deleteProduct(LocalUser user, Long productId) {
        deleteProduct(user, productId, null);
    }

    @Transactional
    public void deleteProduct(LocalUser user, Long productId, String reason) {
        // 1. Проверка прав
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для удаления продукта");
        }

        // 2. Проверяем наличие в заказах
        long ordersCount = orderQuantitiesDAO.countByProductId(productId);

        // 4. Находим продукт
        Product product = productDAO.findById(productId)
                .orElseThrow(() -> new RuntimeException("Продукт с ID " + productId + " не найден"));

        try {
            // 5. Удаляем связанное изображение
            if (product.getImage() != null && !product.getImage().isEmpty()) {
                deleteProductImage(product.getImage());
            }

            // 6. Помечаем связанные объекты как удаленные
            if (product.getInventory() != null) {
                product.getInventory().setDeleted(true);
            }

            if (product.getDescription() != null) {
                product.getDescription().setDeleted(true);
            }

            // 7. SOFT DELETE: Архивируем продукт
            String deleteReason = reason != null ? reason : "Удалено администратором";
            product.softDelete(deleteReason);
            productDAO.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении продукта: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void forceDeleteProduct(LocalUser user, Long productId, String reason) {
        // Двойная проверка прав
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для физического удаления продукта");
        }


        // Используем сервис для корректного удаления с сохранением истории
        productDeletionService.hardDeleteProductWithHistory(productId);
    }

    /**
     * НОВЫЙ МЕТОД: Восстановление удаленного продукта
     */
    @Transactional
    public void restoreProduct(LocalUser user, Long productId) {
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для восстановления продукта");
        }

        Product product = productDAO.findByIdIncludingDeleted(productId)
                .orElseThrow(() -> new RuntimeException("Продукт с ID " + productId + " не найден"));

        if (!product.isDeleted()) {
            throw new RuntimeException("Продукт не был удален");
        }

        // Восстанавливаем продукт
        product.restore();

        // Восстанавливаем связанные объекты
        if (product.getInventory() != null) {
            product.getInventory().setDeleted(false);
        }

        if (product.getDescription() != null) {
            product.getDescription().setDeleted(false);
        }

        productDAO.save(product);
    }

    /**
     * НОВЫЙ МЕТОД: Пакетная очистка старых удаленных продуктов
     */
    @Transactional
    public int cleanupOldDeletedProducts(LocalUser user, int daysOld) {
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для очистки");
        }
        return productDeletionService.batchDeleteOldProducts(daysOld);
    }

    private void deleteProductImage(String s3Key) {
    if (s3Key == null || s3Key.isEmpty()) {
        return;
    }

    try {
        storageService.deleteImage(s3Key);

    } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
    }
}
}
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

    public String saveMultipartImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        try {
            Path uploadPath = Paths.get(uploadConfig.getUploadDir());

            // Создаем директорию, если не существует
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Генерируем уникальное безопасное имя файла
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String safeFileName = UUID.randomUUID().toString() + "." + fileExtension;

            // Сохраняем файл
            Path filePath = uploadPath.resolve(safeFileName);
            Files.write(filePath, imageFile.getBytes());

            // Возвращаем имя файла
            return safeFileName;

        } catch (IOException e) {
            throw new RuntimeException("Ошибка сохранения изображения: " + e.getMessage(), e);
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

            String imageFileName = null;
            if (productBody.getImage() != null && !productBody.getImage().isEmpty()) {
                imageFileName = this.saveMultipartImage(productBody.getImage());
            }

            // Создаем продукт
            Product product = new Product();
            product.setName(productBody.getName());
            product.setShortDescription(productBody.getShortDescription());
            product.setLongDescription(productBody.getLongDescription());
            product.setPrice(productBody.getPrice());
            product.setRaiting(productBody.getRaiting() != null ? productBody.getRaiting() : 0.0);
            product.setImage(imageFileName);
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
        // Проверка прав
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для удаления продукта");
        }

        // Находим продукт
        Product product = productDAO.findById(productId)
                .orElseThrow(() -> {
                    return new RuntimeException("Продукт с ID " + productId + " не найден");
                });

        // Проверяем наличие в заказах
        long ordersCount = orderQuantitiesDAO.countByProductId(productId);

        if (ordersCount > 0) {
            // Обнуляем ссылки на продукт в заказах
            orderQuantitiesDAO.nullifyProductReference(productId);
        }

        try {
            // Удаляем связанное изображение
            if (product.getImage() != null && !product.getImage().isEmpty()) {
                deleteProductImage(product.getImage());
            }

            // Помечаем инвентарь как удаленный
            if (product.getInventory() != null) {
                product.getInventory().setDeleted(true);
            }

            // Помечаем описание как удаленное
            if (product.getDescription() != null) {
                product.getDescription().setDeleted(true);
            }

            // Архивируем продукт (Soft Delete)
            product.softDelete(reason != null ? reason : "Удалено администратором");
            productDAO.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении продукта: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void restoreProduct(LocalUser user, Long productId) {
        // Проверка прав
        if (!user.getRole().getValue().equals("ADMIN")) {
            throw new RuntimeException("Недостаточно прав для восстановления продукта");
        }

        // Находим продукт (включая удаленные)
        Product product = productDAO.findByIdIncludingDeleted(productId)
                .orElseThrow(() -> {
                    return new RuntimeException("Продукт с ID " + productId + " не найден");
                });

        if (!product.isDeleted()) {
            throw new RuntimeException("Продукт не является удаленным");
        }

        try {
            product.restore();
            productDAO.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка при восстановлении продукта: " + e.getMessage(), e);
        }
    }

    public long getOrdersCountByProduct(Long productId) {
        return orderQuantitiesDAO.countByProductId(productId);
    }

    public Object[] getProductStatistics() {
        return productDAO.getProductStatistics();
    }

    public Page<Product> searchProducts(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findByNameContainingIgnoreCase(name, pageable);
    }

    public Page<Product> getProductsByPriceRange(Double minPrice, Double maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findByPriceBetween(minPrice, maxPrice, pageable);
    }

    private void deleteProductImage(String imageFileName) {
        try {
            Path imagePath = Paths.get(uploadConfig.getUploadDir()).resolve(imageFileName);
            if (Files.exists(imagePath)) {
                Files.delete(imagePath);
            }
        } catch (IOException e) {
            // Логируем ошибку, но не прерываем удаление продукта
            System.err.println("Ошибка при удалении файла изображения: " + imageFileName + " - " + e.getMessage());
        }
    }
}
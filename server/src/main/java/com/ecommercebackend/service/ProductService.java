package com.ecommercebackend.service;

import com.ecommercebackend.config.UploadConfig;
import com.ecommercebackend.api.model.ProductBody;
import com.ecommercebackend.model.Inventory;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.dao.ProductDAO;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Service for handling product actions.
 */
@Service
@AllArgsConstructor
public class ProductService {

    private final ProductDAO productDAO;

    private final UploadConfig uploadConfig;

    public String saveBase64Image(String base64Image, String fileName) {
        try {
            Path uploadPath = Paths.get(uploadConfig.getUploadDir());

            // Создаем директорию, если не существует
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Генерируем уникальное безопасное имя файла
            String fileExtension = getFileExtension(fileName);
            String safeFileName = UUID.randomUUID().toString() + "." + fileExtension;

            // Декодируем base64
            String imageData = base64Image;
            if (base64Image.contains(",")) {
                imageData = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(imageData);

            // Сохраняем файл
            Path filePath = uploadPath.resolve(safeFileName);
            Files.write(filePath, imageBytes);

            // Возвращаем web-путь
            return uploadConfig.getWebPath() + safeFileName;

        } catch (Exception e) {
            throw new RuntimeException("Ошибка сохранения изображения: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex + 1);
        }
        return "png"; // расширение по умолчанию
    }

@Transactional
    public Product createProduct(ProductBody productBody) {
        try {
            // 1. Сохраняем изображение
            String imageUrl = this.saveBase64Image(productBody.getImage(), productBody.getImageName());

            // 2. Создаем продукт
            Product product = new Product();
            product.setName(productBody.getName());
            product.setShortDescription(productBody.getShortDescription());
            product.setLongDescription(productBody.getLongDescription());
            product.setPrice(productBody.getPrice());
            product.setRaiting(productBody.getRaiting() != null ? productBody.getRaiting() : 0.0);
            product.setImage(productBody.getImageName());

            // 3. Создаем инвентарь
            Inventory inventory = new Inventory();
            inventory.setProduct(product);
            inventory.setQuantity(productBody.getQuantity() != null ? productBody.getQuantity() : 0);

            // 4. Устанавливаем связь
            product.setInventory(inventory);

            // 5. Сохраняем продукт (инвентарь сохранится каскадно)
            return productDAO.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания продукта: " + e.getMessage(), e);
        }
    }

    public Page<Product> getProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findAll(pageable);
    }
}
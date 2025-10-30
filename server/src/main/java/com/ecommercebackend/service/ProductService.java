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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Service for handling product actions.
 */
@Service
@AllArgsConstructor
public class ProductService {

    private final ProductDAO productDAO;

    private final UploadConfig uploadConfig;

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
    public Product createProduct(ProductBody productBody) {
        try {
            // 1. Проверяем, существует ли продукт с таким именем
            if (productDAO.existsByName(productBody.getName())) {
                throw new RuntimeException("Продукт с именем '" + productBody.getName() + "' уже существует");
            }

            // 2. Сохраняем изображение (MultipartFile)
            String imageFileName = null;
            if (productBody.getImage() != null && !productBody.getImage().isEmpty()) {
                imageFileName = this.saveMultipartImage(productBody.getImage());
            }

            // 3. Создаем продукт
            Product product = new Product();
            product.setName(productBody.getName());
            product.setShortDescription(productBody.getShortDescription());
            product.setLongDescription(productBody.getLongDescription());
            product.setPrice(productBody.getPrice());
            product.setRaiting(productBody.getRaiting() != null ? productBody.getRaiting() : 0.0);
            product.setImage(imageFileName); // Сохраняем имя файла

            // 4. Создаем инвентарь
            Inventory inventory = new Inventory();
            inventory.setProduct(product);
            inventory.setQuantity(productBody.getQuantity() != null ? productBody.getQuantity() : 0);

            // 5. Устанавливаем связь
            product.setInventory(inventory);

            // 6. Сохраняем продукт
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
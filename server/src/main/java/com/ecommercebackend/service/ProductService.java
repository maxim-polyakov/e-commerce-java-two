package com.ecommercebackend.service;

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

import java.util.Base64;
import java.io.FileOutputStream;
import java.io.IOException;
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

    private String saveBase64Image(String base64String, String fileName) throws IOException {
        // Получаем путь к корню проекта
        String projectRoot = System.getProperty("user.dir");
        Path resourcesPath = Paths.get(projectRoot, "src", "main", "resources", "static", "images");

        // Создаем директорию, если она не существует
        Files.createDirectories(resourcesPath);

        Path outputPath = resourcesPath.resolve(fileName);

        // Обрабатываем Base64 строку
        String base64Data = base64String;
        if (base64String.contains(",")) {
            base64Data = base64String.split(",")[1];
        }

        // Декодируем и сохраняем
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        try (FileOutputStream fos = new FileOutputStream(outputPath.toFile())) {
            fos.write(imageBytes);
        }

        return "/images/" + fileName; // Возвращаем путь для сохранения в БД
    }

    @Transactional
    public Product createProduct(ProductBody productBody) {
        try {
            this.saveBase64Image(productBody.getImage(), productBody.getImageName());

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

        } catch (IOException e) {
            throw new RuntimeException("Ошибка сохранения изображения: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания продукта: " + e.getMessage(), e);
        }
    }

    public Page<Product> getProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productDAO.findAll(pageable);
    }
}
package com.ecommercebackend.service;

import com.ecommercebackend.config.S3Config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class YandexStorageService {

    private final S3Config s3Config;
    private S3Client s3Client;

    /**
     * Загружает изображение из MultipartFile в S3
     */
    public String uploadImage(MultipartFile imageFile, String prefix) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        // Генерируем уникальное имя файла
        String originalFileName = imageFile.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + "." + fileExtension;
        String s3Key = (prefix != null ? prefix + "/" : "") + fileName;

        log.info("Загрузка файла {} в S3, ключ: {}", originalFileName, s3Key);

        // Получаем content type
        String contentType = getContentType(originalFileName);

        try (InputStream inputStream = imageFile.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(s3Config.getBucketName())
                    .key(s3Key)
                    .contentType(contentType)
                    .contentLength(imageFile.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, imageFile.getSize()));

            log.info("Файл успешно загружен в S3: {}", s3Key);
            return s3Key; // Возвращаем ключ в S3
        }
    }

    /**
     * Удаляет изображение из S3
     */
    public void deleteImage(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return;
        }

        log.info("Удаление файла из S3: {}", s3Key);

        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(s3Config.getBucketName())
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(request);
            log.info("Файл успешно удален из S3: {}", s3Key);
        } catch (Exception e) {
            log.error("Ошибка при удалении файла из S3: {}", s3Key, e);
            // Не выбрасываем исключение, чтобы не ломать основной процесс
        }
    }

    /**
     * Генерирует публичный URL для доступа к файлу
     */
    public String getImageUrl(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return null;
        }
        return String.format("%s/%s/%s", s3Config.getEndpoint(), s3Config.getBucketName(), s3Key);
    }

    /**
     * Проверяет соединение с S3
     */
    public boolean testConnection() {
        try {
            s3Client.listBuckets();
            log.info("Подключение к Yandex S3 успешно");
            return true;
        } catch (Exception e) {
            log.error("Ошибка подключения к Yandex S3: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Получает список файлов в S3 по префиксу
     */
    public List<String> listFiles(String prefix) {
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                    .bucket(s3Config.getBucketName())
                    .prefix(prefix)
                    .build();

            return s3Client.listObjectsV2(request).contents().stream()
                    .map(S3Object::key)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Ошибка при получении списка файлов из S3", e);
            return List.of();
        }
    }

    // Вспомогательные методы

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

    private String getContentType(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "image/png";
        }

        String extension = getFileExtension(filename).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "bmp" -> "image/bmp";
            default -> "application/octet-stream";
        };
    }
}
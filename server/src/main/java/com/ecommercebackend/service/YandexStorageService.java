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
import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class YandexStorageService {

    private final S3Config s3Config; // Все настройки в одном объекте
    private S3Client s3Client;


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

    public String uploadFile(String key, File file) {
        log.info("Загрузка файла {} в бакет {}, ключ: {}",
                file.getName(), s3Config.getBucketName(), key);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .contentType(getContentType(key))
                .build();

        s3Client.putObject(request, file.toPath());
        log.info("Файл успешно загружен: {}", key);
        return key;
    }

    // ... остальные методы аналогично (замените bucketName на s3Config.getBucketName())

    public List<String> listFiles(String prefix) {
        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(s3Config.getBucketName()) // ← здесь
                .prefix(prefix)
                .build();

        return s3Client.listObjectsV2(request).contents().stream()
                .map(S3Object::key)
                .collect(Collectors.toList());
    }

    public void deleteFile(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(s3Config.getBucketName()) // ← здесь
                .key(key)
                .build();

        s3Client.deleteObject(request);
    }

    private String getContentType(String filename) {
        // ... ваш существующий код
        return "application/octet-stream";
    }
}
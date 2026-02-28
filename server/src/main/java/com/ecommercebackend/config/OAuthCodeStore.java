package com.ecommercebackend.config;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory хранилище OAuth-кодов. Код используется для обмена на JWT токен
 * (избегаем передачи JWT в URL при редиректе на frontend).
 */
@Component
public class OAuthCodeStore {

    private static final long TTL_MS = 2 * 60 * 1000; // 2 минуты

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    public String put(String jwt) {
        String code = UUID.randomUUID().toString().replace("-", "");
        store.put(code, new Entry(System.currentTimeMillis(), jwt));
        return code;
    }

    public String getAndRemove(String code) {
        Entry entry = store.remove(code);
        if (entry == null) {
            return null;
        }
        if (System.currentTimeMillis() - entry.createdAt > TTL_MS) {
            return null;
        }
        return entry.jwt;
    }

    private record Entry(long createdAt, String jwt) {}
}

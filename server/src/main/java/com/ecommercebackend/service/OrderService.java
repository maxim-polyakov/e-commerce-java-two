package com.ecommercebackend.service;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrderQuantities;
import com.ecommercebackend.model.Address;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.dao.ProductDAO;
import com.ecommercebackend.model.dao.WebOrderDAO;
import com.ecommercebackend.model.dao.AddressDAO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
/**
 * Service for handling order actions.
 */
@Service
@AllArgsConstructor
public class OrderService {

    private final WebOrderDAO webOrderDAO;

    private final AddressDAO adressDAO;

    private final ProductDAO productDAO;

    private static final String API_TOKEN = "y0__xC2rpTGCBix9BwgzoivqRXkYgF9ZL3hdTfFQVRtDHLDr_hIqQ";
    private static final String API_URL = "https://b2b.taxi.yandex.net";

    private final HttpClient httpClient;


    public List<WebOrder> getOrders(LocalUser user) {
    return webOrderDAO.findByUser(user);
  }

    @Transactional
    public WebOrder createOrder(WebOrder order, LocalUser user) {
        // 1. Создаем заказ в вашей базе данных
        WebOrder newOrder = new WebOrder();
        newOrder.setUser(user);

        // Загружаем адрес из базы как managed entity
        Address managedAddress = adressDAO.findById(order.getAddress().getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));
        newOrder.setAddress(managedAddress);

        // Создаем новые quantities
        List<WebOrderQuantities> newQuantities = new ArrayList<>();
        if (order.getQuantities() != null) {
            for (WebOrderQuantities quantity : order.getQuantities()) {
                Product managedProduct = productDAO.findById(quantity.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

                WebOrderQuantities newQuantity = new WebOrderQuantities();
                newQuantity.setProduct(managedProduct);
                newQuantity.setQuantity(quantity.getQuantity());
                newQuantity.setOrder(newOrder);

                newQuantities.add(newQuantity);
            }
        }

        newOrder.setQuantities(newQuantities);
        this.validateOrder(newOrder);

        // Сохраняем заказ в БД
        WebOrder savedOrder = webOrderDAO.save(newOrder);

        // 2. Создаем заказ в Яндекс Доставке
        try {
            String yandexRequestJson = createYandexDeliveryRequest(savedOrder, user);
            String yandexResponse = createYandexDelivery(yandexRequestJson, savedOrder);

            // Сохраняем ID заявки из ответа Яндекс (при необходимости)
            System.out.println("Заказ создан в Яндекс Доставке: " + yandexResponse);

        } catch (Exception e) {
            // Логируем ошибку, но не прерываем транзакцию создания заказа в нашей БД
            System.err.println("Ошибка при создании заказа в Яндекс Доставке: " + e.getMessage());
            // Можно добавить логику для повторных попыток или уведомления администратора
        }

        return savedOrder;
    }

    private String createYandexDeliveryRequest(WebOrder order, LocalUser user) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode requestJson = objectMapper.createObjectNode();

        // Добавляем comment напрямую в корень
        requestJson.put("comment", "Заказ из интернет-магазина");

        // 1. Информация о точках маршрута (ОБЯЗАТЕЛЬНО)
        ArrayNode routePoints = objectMapper.createArrayNode();

        // Точка забора (pickup point)
        ObjectNode pickupPoint = objectMapper.createObjectNode();
        pickupPoint.put("point_id", 1);
        pickupPoint.put("visit_order", 1);
        pickupPoint.put("type", "source");
        ObjectNode pickupContact = objectMapper.createObjectNode();
        pickupContact.put("name", "Склад магазина");
        pickupContact.put("phone", "+79991234567");
        pickupPoint.set("contact", pickupContact);
        ObjectNode pickupAddress = objectMapper.createObjectNode();
        pickupAddress.put("fullname", "Москва, ул. Складская, 1"); // ИСПРАВЛЕНО: full → fullname
        ArrayNode pickupCoords = objectMapper.createArrayNode();
        pickupCoords.add(37.617635);
        pickupCoords.add(55.755814);
        pickupAddress.set("coordinates", pickupCoords);
        pickupPoint.set("address", pickupAddress);
        pickupPoint.put("skip_confirmation", false); // Добавлено
        routePoints.add(pickupPoint);

        // Точка доставки (dropoff point)
        ObjectNode dropoffPoint = objectMapper.createObjectNode();
        dropoffPoint.put("point_id", 2); // ИСПРАВЛЕНО: id → point_id
        dropoffPoint.put("visit_order", 2); // Добавлено: порядок посещения
        dropoffPoint.put("type", "destination");
        ObjectNode dropoffContact = objectMapper.createObjectNode();
        dropoffContact.put("name", user.getFirstName() + " " + user.getLastName());
        dropoffContact.put("phone", "+79161234567");
        dropoffPoint.set("contact", dropoffContact);
        ObjectNode dropoffAddress = objectMapper.createObjectNode();
        Address address = order.getAddress();
        dropoffAddress.put("fullname", address.getAddressLine());
        ArrayNode dropoffCoords = objectMapper.createArrayNode();
        dropoffCoords.add(37.617635);
        dropoffCoords.add(55.755814);
        dropoffAddress.set("coordinates", dropoffCoords);
        dropoffPoint.set("address", dropoffAddress);
        dropoffPoint.put("skip_confirmation", false); // Добавлено
        routePoints.add(dropoffPoint);

        requestJson.set("route_points", routePoints);

        // 2. Информация о товарах (ОБЯЗАТЕЛЬНО)
        ArrayNode itemsArray = objectMapper.createArrayNode();
        for (WebOrderQuantities quantity : order.getQuantities()) {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("pickup_point", 1);  // ID точки забора из route_points
            item.put("droppof_point", 2); // ID точки доставки из route_points
            item.put("quantity", quantity.getQuantity());
            item.put("title", quantity.getProduct().getName());
            item.put("article", quantity.getProduct().getId().toString());
            item.put("cost_value", "500.00"); // цена товара
            item.put("cost_currency", "RUB"); // валюта

            // Размеры товара в метрах
            ObjectNode size = objectMapper.createObjectNode();
            size.put("length", 0.1);  // 10 см в метрах
            size.put("width", 0.05);  // 5 см в метрах
            size.put("height", 0.03); // 3 см в метрах
            item.set("size", size);

            // Вес товара в кг
            item.put("weight", 1.0); // 1000 грамм в кг

            itemsArray.add(item);
        }
        requestJson.set("items", itemsArray);

        // 3. Информация о получателе (ОБЯЗАТЕЛЬНО)
        ObjectNode recipientInfo = objectMapper.createObjectNode();
        recipientInfo.put("first_name", user.getFirstName());
        recipientInfo.put("last_name", user.getLastName());
        recipientInfo.put("email", user.getEmail());
        recipientInfo.put("phone", "+79161234567");
        requestJson.set("recipient_info", recipientInfo);

        // 4. Данные для биллинга (ОБЯЗАТЕЛЬНО)
        ObjectNode billingInfo = objectMapper.createObjectNode();
        billingInfo.put("payment_method", "already_paid");
        requestJson.set("billing_info", billingInfo);

        // 5. Дополнительные настройки доставки
        ObjectNode clientRequirements = objectMapper.createObjectNode(); // ИСПРАВЛЕНО: requirements → clientRequirements
        clientRequirements.put("pro_courier", false);
        clientRequirements.put("taxi_class", "courier");
        requestJson.set("client_requirements", clientRequirements); // ИСПРАВЛЕНО: requirements → client_requirements

        // 6. Аварийный контакт (ОБЯЗАТЕЛЬНО)
        ObjectNode emergencyContact = objectMapper.createObjectNode();
        emergencyContact.put("name", user.getFirstName() + " " + user.getLastName());
        emergencyContact.put("phone", "+79161234567");
        requestJson.set("emergency_contact", emergencyContact);

        // 7. Опциональный возврат
        requestJson.put("optional_return", false);

        System.out.println("Отправляемый JSON в Яндекс Доставку:");
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestJson));

        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestJson);
    }

    private String createYandexDelivery(String requestBody, WebOrder order) throws Exception {
        try {
            // Добавляем request_id как query parameter в URL
            String urlWithParams = API_URL + "/b2b/cargo/integration/v2/claims/create?request_id=" + order.getId();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlWithParams))
                    .header("Authorization", "OAuth " + API_TOKEN)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("Accept-Language", "ru") // Обязательный заголовок
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            int statusCode = response.statusCode();
            System.out.println("Статус ответа от Яндекс Доставки: " + statusCode);
            System.out.println("Тело ответа: " + response.body());

            if (statusCode >= 200 && statusCode < 300) {
                return response.body();
            } else {
                throw new RuntimeException("Yandex API error: " + statusCode + ", body: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Ошибка при вызове API Яндекс Доставки: " + e.getMessage());
            throw e;
        }
    }

    private void validateOrder(WebOrder order) {
        if (order == null) {
        throw new IllegalArgumentException("Order cannot be null");
        }

        if (order.getUser() == null) {
            throw new IllegalArgumentException("Order must have a user");
        }

        if (order.getAddress() == null) {
            throw new IllegalArgumentException("Order must have a delivery address");
        }

        if (order.getQuantities() == null || order.getQuantities().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }
    }
}

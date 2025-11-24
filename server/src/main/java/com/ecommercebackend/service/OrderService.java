package com.ecommercebackend.service;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrderQuantities;
import com.ecommercebackend.model.Address;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.Description;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.dao.DescriptionDAO;
import com.ecommercebackend.model.dao.ProductDAO;
import com.ecommercebackend.model.dao.WebOrderDAO;
import com.ecommercebackend.model.dao.AddressDAO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import com.ecommercebackend.config.YandexDeliveryConfig;
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

    private final YandexDeliveryConfig yandexDeliveryConfig;

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

        requestJson.put("status", "accepted");
        requestJson.put("auto_accept", true);
        requestJson.put("comment", "Заказ №" + order.getId() + " из интернет-магазина");

        // Добавляем comment напрямую в корень
        requestJson.put("comment", "Заказ из интернет-магазина");

        // 1. Информация о точках маршрута (ОБЯЗАТЕЛЬНО)
        ArrayNode routePoints = objectMapper.createArrayNode();

        // Точка забора (pickup point) - СКЛАД
        ObjectNode pickupPoint = objectMapper.createObjectNode();
        pickupPoint.put("point_id", 1);
        pickupPoint.put("visit_order", 1);
        pickupPoint.put("type", "source");

        // ДОБАВЛЕНО: platform_station для точки забора
        ObjectNode platformStation = objectMapper.createObjectNode();
        platformStation.put("platform_id", yandexDeliveryConfig.getPlatform_id());
        pickupPoint.set("platform_station", platformStation);

        ObjectNode pickupContact = objectMapper.createObjectNode();
        pickupContact.put("name", "Склад магазина");
        pickupContact.put("phone", "+79991234567");
        pickupPoint.set("contact", pickupContact);
        ObjectNode pickupAddress = objectMapper.createObjectNode();
        pickupAddress.put("fullname", "Москва, Ленинградский проспект, 1");
        ArrayNode pickupCoords = objectMapper.createArrayNode();
        pickupCoords.add(37.517635);
        pickupCoords.add(55.755814);
        pickupAddress.set("coordinates", pickupCoords);
        pickupPoint.set("address", pickupAddress);
        pickupPoint.put("skip_confirmation", false);
        routePoints.add(pickupPoint);

        // Точка доставки (dropoff point) - АДРЕС КЛИЕНТА
        ObjectNode dropoffPoint = objectMapper.createObjectNode();
        dropoffPoint.put("point_id", 2);
        dropoffPoint.put("visit_order", 2);
        dropoffPoint.put("type", "destination");
        ObjectNode dropoffContact = objectMapper.createObjectNode();
        dropoffContact.put("name", user.getFirstName() + " " + user.getLastName());
        dropoffContact.put("phone", "+79161234567");
        dropoffPoint.set("contact", dropoffContact);
        ObjectNode dropoffAddress = objectMapper.createObjectNode();
        Address address = order.getAddress();

        // Если адрес клиента не заполнен, используем тестовый адрес
        String clientAddress = (address.getAddressLine() != null && !address.getAddressLine().isEmpty())
            ? address.getAddressLine()
            : "Москва, ул. Тверская, 15";

        dropoffAddress.put("fullname", clientAddress);
        ArrayNode dropoffCoords = objectMapper.createArrayNode();
        dropoffCoords.add(37.617635);
        dropoffCoords.add(55.755814);
        dropoffAddress.set("coordinates", dropoffCoords);
        dropoffPoint.set("address", dropoffAddress);
        dropoffPoint.put("skip_confirmation", false);
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

            // ИСПРАВЛЕНИЕ: Получаем стоимость продукта
            item.put("cost_value", quantity.getProduct().getPrice().toString()); // цена товара
            item.put("cost_currency", "RUB"); // валюта

            // РАЗМЕРЫ ТОВАРА: Получаем реальные размеры из Description
            ObjectNode size = objectMapper.createObjectNode();
            Description description = quantity.getProduct().getDescription();

            if (description != null && description.getDimensions() != null) {
                // Парсим размеры из формата "В×Ш×Г" например "178×60×63 см"
                String dimensions = description.getDimensions();
                double[] parsedDimensions = parseDimensions(dimensions);

                // Преобразуем в метры (делим на 100)
                size.put("length", parsedDimensions[0] / 100.0);  // Длина (Ширина в исходных данных)
                size.put("width", parsedDimensions[1] / 100.0);   // Ширина (Глубина в исходных данных)
                size.put("height", parsedDimensions[2] / 100.0);  // Высота
            } else {
                // Значения по умолчанию, если размеры не указаны
                size.put("length", 0.1);  // 10 см в метрах
                size.put("width", 0.05);  // 5 см в метрах
                size.put("height", 0.03); // 3 см в метрах
            }
            item.set("size", size);

            // ВЕС ТОВАРА: Получаем реальный вес из Description
            if (description != null && description.getWeight() != null) {
                double weightKg = parseWeight(description.getWeight());
                item.put("weight", weightKg);
            } else {
                item.put("weight", 1.0); // Значение по умолчанию: 1 кг
            }

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
        ObjectNode clientRequirements = objectMapper.createObjectNode();
        clientRequirements.put("pro_courier", false);
        clientRequirements.put("taxi_class", "courier");
        requestJson.set("client_requirements", clientRequirements);

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

    // Метод для парсинга размеров из строки формата "В×Ш×Г" или "ВxШxГ"
    private double[] parseDimensions(String dimensions) {
        try {
            if (dimensions == null || dimensions.trim().isEmpty()) {
                return getDefaultDimensions();
            }

            // Удаляем единицы измерения и пробелы
            String cleanDimensions = dimensions.toLowerCase()
                    .replace("см", "")
                    .replace("cm", "")
                    .replace(" ", "")
                    .trim();

            // Заменяем оба возможных разделителя на стандартный
            cleanDimensions = cleanDimensions.replace('x', '×');

            // Разделяем по символу ×
            String[] parts = cleanDimensions.split("×");

            if (parts.length == 3) {
                double height = Double.parseDouble(parts[0]); // Высота
                double width = Double.parseDouble(parts[1]);  // Ширина
                double length = Double.parseDouble(parts[2]); // Длина (Глубина)

                // Проверяем, что размеры положительные
                if (height > 0 && width > 0 && length > 0) {
                    return new double[]{length, width, height};
                } else {
                    System.err.println("Некорректные размеры (неположительные значения): " + dimensions);
                }
            } else {
                System.err.println("Некорректный формат размеров (ожидается 3 части): " + dimensions);
            }
        } catch (Exception e) {
            System.err.println("Ошибка парсинга размеров: " + dimensions + " - " + e.getMessage());
        }

        // Возвращаем значения по умолчанию при ошибке
        return getDefaultDimensions();
    }

    // Вспомогательный метод для получения размеров по умолчанию
    private double[] getDefaultDimensions() {
        return new double[]{10.0, 5.0, 3.0};
    }

    // Метод для парсинга веса из строки
    private double parseWeight(String weight) {
        try {
            // Удаляем единицы измерения и пробелы
            String cleanWeight = weight.replace("кг", "").replace(" ", "");
            return Double.parseDouble(cleanWeight);
        } catch (Exception e) {
            System.err.println("Ошибка парсинга веса: " + weight);
            return 1.0; // Значение по умолчанию
        }
    }

    private String createYandexDelivery(String requestBody, WebOrder order) throws Exception {
        try {
            // Добавляем request_id как query parameter в URL
            String urlWithParams = yandexDeliveryConfig.getUrl() + "/b2b/cargo/integration/v2/claims/create?request_id=" + order.getId();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlWithParams))
                    .header("Authorization", "Bearer " + yandexDeliveryConfig.getToken())
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
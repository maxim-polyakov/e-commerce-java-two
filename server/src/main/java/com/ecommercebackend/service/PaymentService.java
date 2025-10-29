package com.ecommercebackend.service;

import com.ecommercebackend.api.security.YooKassaConfig;
import lombok.AllArgsConstructor;
import ru.loolzaaa.youkassa.model.Payment;
import ru.loolzaaa.youkassa.pojo.Amount;
import ru.loolzaaa.youkassa.pojo.Confirmation;
import org.springframework.beans.factory.annotation.Autowired;
import ru.loolzaaa.youkassa.client.ApiClient;
import ru.loolzaaa.youkassa.client.ApiClientBuilder;
import ru.loolzaaa.youkassa.processors.PaymentProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
public class PaymentService {

    private final YooKassaConfig yooKassaConfig;


    public Payment createPayment(String amountValue, String description, String confirmationReturnUrl) {
        // Инициализация клиента
        ApiClient client = ApiClientBuilder.newBuilder()
                .configureBasicAuth(yooKassaConfig.getShopId(), yooKassaConfig.getSecretKey())
                .build();

        PaymentProcessor paymentProcessor = new PaymentProcessor(client);

        // Создание объекта Amount
        Amount amount = new Amount();
        try {
            java.lang.reflect.Field valueField = Amount.class.getDeclaredField("value");
            valueField.setAccessible(true);
            valueField.set(amount, amountValue);

            java.lang.reflect.Field currencyField = Amount.class.getDeclaredField("currency");
            currencyField.setAccessible(true);
            currencyField.set(amount, "RUB");
        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания Amount", e);
        }

        // Создание объекта Confirmation
        Confirmation confirmation = new Confirmation();
        try {
            java.lang.reflect.Field typeField = Confirmation.class.getDeclaredField("type");
            typeField.setAccessible(true);
            typeField.set(confirmation, "redirect");

            java.lang.reflect.Field returnUrlField = Confirmation.class.getDeclaredField("returnUrl");
            returnUrlField.setAccessible(true);
            returnUrlField.set(confirmation, confirmationReturnUrl);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания Confirmation", e);
        }

        // Создание объекта Payment
        Payment paymentParams = new Payment();
        try {
            java.lang.reflect.Field amountField = Payment.class.getDeclaredField("amount");
            amountField.setAccessible(true);
            amountField.set(paymentParams, amount);

            java.lang.reflect.Field descriptionField = Payment.class.getDeclaredField("description");
            descriptionField.setAccessible(true);
            descriptionField.set(paymentParams, description);

            java.lang.reflect.Field confirmationField = Payment.class.getDeclaredField("confirmation");
            confirmationField.setAccessible(true);
            confirmationField.set(paymentParams, confirmation);

            java.lang.reflect.Field captureField = Payment.class.getDeclaredField("capture");
            captureField.setAccessible(true);
            captureField.set(paymentParams, true);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка создания Payment", e);
        }

        // Создание платежа в YooKassa
        return paymentProcessor.create(paymentParams, UUID.randomUUID().toString());
    }
}
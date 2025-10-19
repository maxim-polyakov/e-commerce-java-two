package com.ecommercebackend.service;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrderQuantities;
import com.ecommercebackend.model.Address;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.dao.ProductDAO;
import com.ecommercebackend.model.dao.WebOrderDAO;
import com.ecommercebackend.model.dao.AddressDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for handling order actions.
 */
@Service
public class OrderService {

    @Autowired
    private WebOrderDAO webOrderDAO;
    @Autowired
    private AddressDAO adressDAO;

    @Autowired
    private ProductDAO productDAO;

    public List<WebOrder> getOrders(LocalUser user) {
    return webOrderDAO.findByUser(user);
  }

    @Transactional
    public WebOrder createOrder(WebOrder order, LocalUser user) {
        // Создаем НОВЫЙ объект заказа
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
                // Загружаем продукт из базы как managed entity
                Product managedProduct = productDAO.findById(quantity.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

                // Создаем НОВЫЙ объект WebOrderQuantities (без ID!)
                WebOrderQuantities newQuantity = new WebOrderQuantities();
                newQuantity.setProduct(managedProduct);
                newQuantity.setQuantity(quantity.getQuantity());
                newQuantity.setOrder(newOrder); // устанавливаем связь

                newQuantities.add(newQuantity);
            }
        }

        newOrder.setQuantities(newQuantities);
        this.validateOrder(newOrder);

        return webOrderDAO.save(newOrder);
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

package com.ecommercebackend.service;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.dao.WebOrderDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for handling order actions.
 */
@Service
public class OrderService {

  @Autowired
  private WebOrderDAO webOrderDAO;

  public List<WebOrder> getOrders(LocalUser user) {
    return webOrderDAO.findByUser(user);
  }

  @Transactional
  public WebOrder createOrder(WebOrder order, LocalUser user) {
    order.setUser(user);

    // Валидация заказа
    this.validateOrder(order);

    return webOrderDAO.save(order);
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

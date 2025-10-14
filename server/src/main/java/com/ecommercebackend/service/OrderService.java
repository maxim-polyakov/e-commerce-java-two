package com.ecommercebackend.service;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.model.dao.WebOrderDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

}

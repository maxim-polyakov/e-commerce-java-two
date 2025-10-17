package com.ecommercebackend.api.controller.order;

import com.ecommercebackend.api.model.RegistrationBody;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller to handle requests to create, update and view orders.
 */
@RestController
@RequestMapping("/order")
public class OrderController {

  @Autowired
  private OrderService orderService;

  @GetMapping
  public List<WebOrder> getOrders(@AuthenticationPrincipal LocalUser user) {
    return orderService.getOrders(user);
  }

  @PostMapping("/create")
  public WebOrder createOrder(@AuthenticationPrincipal LocalUser user, @Valid @RequestBody WebOrder order) {
    return orderService.createOrder(order, user);
  }

}

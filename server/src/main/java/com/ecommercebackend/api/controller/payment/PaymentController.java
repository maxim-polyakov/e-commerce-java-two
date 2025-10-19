package com.ecommercebackend.api.controller.payment;

import com.ecommercebackend.api.model.RegistrationBody;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.api.model.PaymentBody;
import com.ecommercebackend.model.WebOrder;
import com.ecommercebackend.service.PaymentService;
import jakarta.validation.Valid;
import ru.loolzaaa.youkassa.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller to handle requests to create, update and view orders.
 */
@RestController
@RequestMapping("/pay")
public class PaymentController {

  @Autowired
  private PaymentService paymentService;

  @PostMapping
  public Payment createOrder(@AuthenticationPrincipal LocalUser user, @Valid @RequestBody PaymentBody body) {
    return paymentService.createPayment(body.getAmount(), body.getDescription(), body.getConfirmationReturnUrl());
  }

}

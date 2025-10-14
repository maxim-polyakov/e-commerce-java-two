package com.ecommercebackend.api.controller.user;

import com.ecommercebackend.api.model.DataChange;
import com.ecommercebackend.model.Address;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.dao.AddressDAO;
import com.ecommercebackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

/**
 * Rest Controller for user data interactions.
 */
@RestController
@RequestMapping("/user")
public class UserController {

  /** The Address DAO. */
  @Autowired
  private AddressDAO addressDAO;

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  @Autowired
  private UserService userService;

  @GetMapping("/{userId}/address")
  public ResponseEntity<List<Address>> getAddress(
      @AuthenticationPrincipal LocalUser user, @PathVariable Long userId) {
    if (!userService.userHasPermissionToUser(user, userId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    return ResponseEntity.ok(addressDAO.findByUser_Id(userId));
  }

  @PutMapping("/{userId}/address")
  public ResponseEntity<Address> putAddress(
      @AuthenticationPrincipal LocalUser user, @PathVariable Long userId,
      @RequestBody Address address) {
    if (!userService.userHasPermissionToUser(user, userId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    address.setId(null);
    LocalUser refUser = new LocalUser();
    refUser.setId(userId);
    address.setUser(refUser);
    Address savedAddress = addressDAO.save(address);
    simpMessagingTemplate.convertAndSend("/topic/user/" + userId + "/address",
        new DataChange<>(DataChange.ChangeType.INSERT, address));
    return ResponseEntity.ok(savedAddress);
  }

  @PatchMapping("/{userId}/address/{addressId}")
  public ResponseEntity<Address> patchAddress(
      @AuthenticationPrincipal LocalUser user, @PathVariable Long userId,
      @PathVariable Long addressId, @RequestBody Address address) {
    if (!userService.userHasPermissionToUser(user, userId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    if (address.getId() == addressId) {
      Optional<Address> opOriginalAddress = addressDAO.findById(addressId);
      if (opOriginalAddress.isPresent()) {
        LocalUser originalUser = opOriginalAddress.get().getUser();
        if (originalUser.getId() == userId) {
          address.setUser(originalUser);
          Address savedAddress = addressDAO.save(address);
          simpMessagingTemplate.convertAndSend("/topic/user/" + userId + "/address",
              new DataChange<>(DataChange.ChangeType.UPDATE, address));
          return ResponseEntity.ok(savedAddress);
        }
      }
    }
    return ResponseEntity.badRequest().build();
  }

}

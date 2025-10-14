package com.youtube.tutorial.ecommercebackend.exception;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * Exception to highlight a user does not have a verified email address.
 */
public class UserNotVerifiedException extends Exception {

  @Autowired
  private boolean newEmailSent;

  public boolean isNewEmailSent() {
    return newEmailSent;
  }

}

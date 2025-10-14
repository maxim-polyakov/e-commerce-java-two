package com.youtube.tutorial.ecommercebackend.service;

import com.youtube.tutorial.ecommercebackend.exception.EmailFailureException;
import com.youtube.tutorial.ecommercebackend.model.LocalUser;
import com.youtube.tutorial.ecommercebackend.model.VerificationToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for handling emails being sent.
 */
@Service
public class EmailService {

  /** The from address to use on emails. */
  @Value("${email.from}")
  private String fromAddress;
  /** The url of the front end for links. */
  @Value("${app.frontend.url}")
  private String url;
  /** The JavaMailSender instance. */
  private JavaMailSender javaMailSender;

  public EmailService(JavaMailSender javaMailSender) {
    this.javaMailSender = javaMailSender;
  }

  private SimpleMailMessage makeMailMessage() {
    SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
    simpleMailMessage.setFrom(fromAddress);
    return simpleMailMessage;
  }

  public void sendVerificationEmail(VerificationToken verificationToken) throws EmailFailureException {
    SimpleMailMessage message = makeMailMessage();
    message.setTo(verificationToken.getUser().getEmail());
    message.setSubject("Verify your email to active your account.");
    message.setText("Please follow the link below to verify your email to active your account.\n" +
        url + "/auth/verify?token=" + verificationToken.getToken());
    try {
      javaMailSender.send(message);
    } catch (MailException ex) {
      System.out.println(ex.getMessage());
      throw new EmailFailureException();
    }
  }

  public void sendPasswordResetEmail(LocalUser user, String token) throws EmailFailureException {
    SimpleMailMessage message = makeMailMessage();
    message.setTo(user.getEmail());
    message.setSubject("Your password reset request link.");
    message.setText("You requested a password reset on our website. Please " +
        "find the link below to be able to reset your password.\n" + url +
        "/auth/reset?token=" + token);
    try {
      javaMailSender.send(message);
    } catch (MailException ex) {
      throw new EmailFailureException();
    }
  }

}

package com.ecommercebackend.service;

import com.ecommercebackend.model.enums.Role;
import com.ecommercebackend.api.model.LoginBody;
import com.ecommercebackend.api.model.PasswordResetBody;
import com.ecommercebackend.api.model.RegistrationBody;
import com.ecommercebackend.exception.EmailFailureException;
import com.ecommercebackend.exception.EmailNotFoundException;
import com.ecommercebackend.exception.UserAlreadyExistsException;
import com.ecommercebackend.exception.UserNotVerifiedException;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.VerificationToken;
import com.ecommercebackend.model.dao.LocalUserDAO;
import com.ecommercebackend.model.dao.VerificationTokenDAO;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

/**
 * Service for handling user actions.
 */
@Service
@AllArgsConstructor
public class UserService {

  private final LocalUserDAO localUserDAO;

  private final VerificationTokenDAO verificationTokenDAO;

  private final EncryptionService encryptionService;

  private final JWTService jwtService;

  private final EmailService emailService;

  public LocalUser registerUser(RegistrationBody registrationBody) throws UserAlreadyExistsException, EmailFailureException {
    if (localUserDAO.findByEmailIgnoreCase(registrationBody.getEmail()).isPresent()
        || localUserDAO.findByUsernameIgnoreCase(registrationBody.getUsername()).isPresent()) {
      throw new UserAlreadyExistsException();
    }
    Role role = registrationBody.getRole() != null ? registrationBody.getRole() : Role.USER;

    LocalUser user = new LocalUser();
    user.setEmail(registrationBody.getEmail());
    user.setUsername(registrationBody.getUsername());
    user.setFirstName(registrationBody.getFirstName());
    user.setLastName(registrationBody.getLastName());
    user.setRole(role);
    user.setPassword(encryptionService.encryptPassword(registrationBody.getPassword()));
    VerificationToken verificationToken = createVerificationToken(user);
    emailService.sendVerificationEmail(verificationToken);
    return localUserDAO.save(user);
  }

  private VerificationToken createVerificationToken(LocalUser user) {
    VerificationToken verificationToken = new VerificationToken();
    verificationToken.setToken(jwtService.generateVerificationJWT(user));
    verificationToken.setCreatedTimestamp(new Timestamp(System.currentTimeMillis()));
    verificationToken.setUser(user);
    user.getVerificationTokens().add(verificationToken);
    return verificationToken;
  }

public String loginUser(LoginBody loginBody) throws UserNotVerifiedException, EmailFailureException {
    String usernameOrEmail = loginBody.getUsernameoremail();

    // Сначала пробуем найти по username
    Optional<LocalUser> opUser = localUserDAO.findByUsernameIgnoreCase(usernameOrEmail);

    // Если не нашли по username, пробуем найти по email
    if (!opUser.isPresent()) {
        opUser = localUserDAO.findByEmailIgnoreCase(usernameOrEmail);
    }

    if (opUser.isPresent()) {
        LocalUser user = opUser.get();
        if (encryptionService.verifyPassword(loginBody.getPassword(), user.getPassword())) {
            if (user.isEmailVerified()) {
                return jwtService.generateJWT(user);
            } else {
                List<VerificationToken> verificationTokens = user.getVerificationTokens();
                boolean resend = verificationTokens.size() == 0 ||
                    verificationTokens.get(0).getCreatedTimestamp().before(new Timestamp(System.currentTimeMillis() - (60 * 60 * 1000)));
                if (resend) {
                    VerificationToken verificationToken = createVerificationToken(user);
                    verificationTokenDAO.save(verificationToken);
                    emailService.sendVerificationEmail(verificationToken);
                }
                throw new UserNotVerifiedException(resend);
            }
        }
    }
    return null;
}

  /**
   * Verifies a user from the given token.
   * @param token The token to use to verify a user.
   * @return True if it was verified, false if already verified or token invalid.
   */
  @Transactional
  public boolean verifyUser(String token) {
    Optional<VerificationToken> opToken = verificationTokenDAO.findByToken(token);
    if (opToken.isPresent()) {
      VerificationToken verificationToken = opToken.get();
      LocalUser user = verificationToken.getUser();
      if (!user.isEmailVerified()) {
        user.setEmailVerified(true);
        localUserDAO.save(user);
        verificationTokenDAO.deleteByUser(user);
        return true;
      }
    }
    return false;
  }

  /**
   * Sends the user a forgot password reset based on the email provided.
   * @param email The email to send to.
   * @throws EmailNotFoundException Thrown if there is no user with that email.
   * @throws EmailFailureException
   */
  public void forgotPassword(String email) throws EmailNotFoundException, EmailFailureException {
    Optional<LocalUser> opUser = localUserDAO.findByEmailIgnoreCase(email);
    if (opUser.isPresent()) {
      LocalUser user = opUser.get();
      String token = jwtService.generatePasswordResetJWT(user);
      emailService.sendPasswordResetEmail(user, token);
    } else {
      throw new EmailNotFoundException();
    }
  }

  /**
   * Resets the users password using a given token and email.
   * @param body The password reset information.
   */
  public void resetPassword(PasswordResetBody body) {
    String email = jwtService.getResetPasswordEmail(body.getToken());
    Optional<LocalUser> opUser = localUserDAO.findByEmailIgnoreCase(email);
    if (opUser.isPresent()) {
      LocalUser user = opUser.get();
      user.setPassword(encryptionService.encryptPassword(body.getPassword()));
      localUserDAO.save(user);
    }
  }

  /**
   * Method to check if an authenticated user has permission to a user ID.
   * @param user The authenticated user.
   * @param id The user ID.
   * @return True if they have permission, false otherwise.
   */
  public boolean userHasPermissionToUser(LocalUser user, Long id) {
    return user.getId() == id;
  }

}

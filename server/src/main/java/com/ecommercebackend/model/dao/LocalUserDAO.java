package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.LocalUser;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;

/**
 * Data Access Object for the LocalUser data.
 */
public interface LocalUserDAO extends ListCrudRepository<LocalUser, Long> {

  Optional<LocalUser> findByUsernameIgnoreCase(String username);

  Optional<LocalUser> findByEmailIgnoreCase(String email);

}

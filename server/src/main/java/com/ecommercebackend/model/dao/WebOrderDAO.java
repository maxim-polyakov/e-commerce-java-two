package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.WebOrder;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data Access Object to access WebOrder data.
 */
@Repository
public interface WebOrderDAO extends ListCrudRepository<WebOrder, Long> {

  List<WebOrder> findByUser(LocalUser user);

}

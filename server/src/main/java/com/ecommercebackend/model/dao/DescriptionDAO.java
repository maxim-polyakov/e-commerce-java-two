package com.ecommercebackend.model.dao;

import com.ecommercebackend.model.Description;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DescriptionDAO extends JpaRepository<Description, Long> {

    Optional<Description> findByProductId(Long productId);

    Optional<Description> findByArticleSku(String articleSku);

    boolean existsByArticleSku(String articleSku);

    void deleteByProductId(Long productId);
}
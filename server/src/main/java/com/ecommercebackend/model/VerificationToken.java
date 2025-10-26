package com.ecommercebackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

/**
 * Token that has been sent to the users email for verification.
 */
@Entity
@Table(name = "verification_token")
@Getter
@Setter
public class VerificationToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;


  @Column(name = "token", nullable = false, unique = true, columnDefinition = "TEXT")
  private String token;

  @Column(name = "created_timestamp", nullable = false)
  private Timestamp createdTimestamp;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private LocalUser user;

}
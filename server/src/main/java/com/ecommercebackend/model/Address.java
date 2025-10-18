package com.ecommercebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Address for the user to be billed/delivered to.
 */
@Entity
@Table(name = "address")
public class Address {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @Column(name = "address_line", nullable = false, length = 512)
  private String addressLine;


  @Column(name = "city", nullable = false)
  private String city;

  @Column(name = "country", nullable = false, length = 75)
  private String country;

  @JsonIgnore
  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private LocalUser user;

  public LocalUser getUser() {
    return user;
  }

  public void setUser(LocalUser user) {
    this.user = user;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getAddressLine() {
    return addressLine;
  }


  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

}
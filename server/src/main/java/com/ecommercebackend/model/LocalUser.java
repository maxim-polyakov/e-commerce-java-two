package com.ecommercebackend.model;

import com.ecommercebackend.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * User for authentication with our website.
 */
@Entity
@Table(name = "local_user")
@Getter
@Setter
public class LocalUser implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @Column(name = "username", nullable = false, unique = true)
  private String username;

  @JsonIgnore
  @Column(name = "password", nullable = false, length = 1000)
  private String password;

  @Column(name = "email", nullable = false, unique = true, length = 320)
  private String email;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @JsonIgnore
  @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<Address> addresses = new ArrayList<>();

  @JsonIgnore
  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("id desc")
  private List<VerificationToken> verificationTokens = new ArrayList<>();

  @Column(name = "email_verified", nullable = false)
  private Boolean emailVerified = false;

  @Column(name = "role", nullable = false)
  private Role role;

  public Boolean isEmailVerified() {
    return emailVerified;
  }


  @JsonIgnore
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of();
  }

  @JsonIgnore
  public boolean isAccountNonExpired() {
    return true;
  }

  @JsonIgnore
  public boolean isAccountNonLocked() {
    return true;
  }

  @JsonIgnore
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @JsonIgnore
  public boolean isEnabled() {
    return true;
  }
}
package com.ecommercebackend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * A product available for purchasing.
 */
@Entity
@Table(name = "product")
public class Product {


  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @Column(name = "name", nullable = false, unique = true)
  private String name;

  @Column(name = "short_description", nullable = false)
  private String shortDescription;

  @Column(name = "long_description")
  private String longDescription;

  @Column(name = "price", nullable = false)
  private Double price;

  @Column(name ="raiting", nullable = false)
  private Double raiting;

  @Column(name ="image", nullable = false)
  private String image;

  @OneToOne(mappedBy = "product", cascade = CascadeType.REMOVE, optional = false, orphanRemoval = true)
  private Inventory inventory;

  public Double getRaiting() { return raiting;}

  public void setRaiting(Double raiting) { this.raiting = raiting;}

  public Inventory getInventory() {
    return inventory;
  }

  public void setInventory(Inventory inventory) {
    this.inventory = inventory;
  }

  public Double getPrice() {
    return price;
  }

  public void setPrice(Double price) {
    this.price = price;
  }

  public String getLongDescription() {
    return longDescription;
  }

  public String getImage() { return image;}

  public void setImage(String image) { this.image = image;}

  public void setLongDescription(String longDescription) {
    this.longDescription = longDescription;
  }

  public String getShortDescription() {
    return shortDescription;
  }

  public void setShortDescription(String shortDescription) {
    this.shortDescription = shortDescription;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

}
package com.youtube.tutorial.ecommercebackend.api.model;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * Data model to outline data changes for websockets.
 * @param <T> The data type being changed.
 */
public class DataChange<T> {

  @Autowired
  private ChangeType changeType;

  @Autowired
  private T data;

  public DataChange() {
  }

  public ChangeType getChangeType() {
    return changeType;
  }

  public T getData() {
    return data;
  }

  public void setData(T data) {
    this.data = data;
  }

  public enum ChangeType {
    INSERT,
    UPDATE,
    DELETE
  }

}

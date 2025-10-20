package com.ecommercebackend.api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model to outline data changes for websockets.
 * @param <T> The data type being changed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataChange<T> {

    private ChangeType changeType;
    private T data;

    public enum ChangeType {
        INSERT,
        UPDATE,
        DELETE
    }
}
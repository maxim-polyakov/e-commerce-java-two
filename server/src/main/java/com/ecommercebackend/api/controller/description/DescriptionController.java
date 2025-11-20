package com.ecommercebackend.api.controller.description;

import com.ecommercebackend.api.model.DescriptionBody;
import com.ecommercebackend.api.model.DescriptionResponse;
import com.ecommercebackend.model.Description;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.service.DescriptionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling product description operations.
 */
@RestController
@RequestMapping("/description")
@AllArgsConstructor
public class DescriptionController {

    private final DescriptionService descriptionService;

    /**
     * Create a new description for a product.
     */
    @PostMapping("/product/{productId}")
    public ResponseEntity<DescriptionResponse> createDescription(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long productId,
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.createDescription(descriptionBody, productId, user);
        DescriptionResponse response = convertToResponse(description);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get description by product ID.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<DescriptionResponse> getDescriptionByProductId(@PathVariable Long productId) {
        Description description = descriptionService.getDescriptionByProductId(productId);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Get description by its ID.
     */
    @GetMapping("/{descriptionId}")
    public ResponseEntity<DescriptionResponse> getDescriptionById(@PathVariable Long descriptionId) {
        Description description = descriptionService.getDescriptionById(descriptionId);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing description.
     */
    @PutMapping("/{descriptionId}")
    public ResponseEntity<DescriptionResponse> updateDescription(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long descriptionId,
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.updateDescription(descriptionId, descriptionBody, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Update description by product ID.
     */
    @PutMapping("/product/{productId}")
    public ResponseEntity<DescriptionResponse> updateDescriptionByProductId(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long productId,
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.updateDescriptionByProductId(productId, descriptionBody, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Create or update description for a product.
     */
    @PatchMapping("/product/{productId}")
    public ResponseEntity<DescriptionResponse> createOrUpdateDescription(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long productId,
            @RequestBody DescriptionBody descriptionBody) {

        Description description = descriptionService.createOrUpdateDescription(descriptionBody, productId, user);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete description by its ID.
     */
    @DeleteMapping("/{descriptionId}")
    public ResponseEntity<Void> deleteDescription(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long descriptionId) {

        descriptionService.deleteDescription(descriptionId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete description by product ID.
     */
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteDescriptionByProductId(
            @AuthenticationPrincipal LocalUser user,
            @PathVariable Long productId) {

        descriptionService.deleteDescriptionByProductId(productId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if description exists for product.
     */
    @GetMapping("/product/{productId}/exists")
    public ResponseEntity<Boolean> checkDescriptionExists(@PathVariable Long productId) {
        boolean exists = descriptionService.descriptionExistsForProduct(productId);
        return ResponseEntity.ok(exists);
    }

    /**
     * Get description by article SKU.
     */
    @GetMapping("/sku/{articleSku}")
    public ResponseEntity<DescriptionResponse> getDescriptionByArticleSku(@PathVariable String articleSku) {
        Description description = descriptionService.getDescriptionByArticleSku(articleSku);
        DescriptionResponse response = convertToResponse(description);
        return ResponseEntity.ok(response);
    }

    /**
     * Convert Description entity to DescriptionResponse DTO.
     */
    private DescriptionResponse convertToResponse(Description description) {
        if (description == null) {
            return null;
        }

        DescriptionResponse response = new DescriptionResponse();
        response.setId(description.getId());

        if (description.getProduct() != null) {
            response.setProductId(description.getProduct().getId());
            response.setProductName(description.getProduct().getName());
        }

        response.setModel(description.getModel());
        response.setArticleSku(description.getArticleSku());
        response.setDimensions(description.getDimensions());
        response.setWeight(description.getWeight());
        response.setColorFinish(description.getColorFinish());
        response.setPowerConsumption(description.getPowerConsumption());
        response.setCapacity(description.getCapacity());
        response.setMaterials(description.getMaterials());
        response.setWarranty(description.getWarranty());
        response.setCountryOfOrigin(description.getCountryOfOrigin());
        return response;
    }
}
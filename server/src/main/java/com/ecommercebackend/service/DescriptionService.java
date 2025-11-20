package com.ecommercebackend.service;

import com.ecommercebackend.api.model.DescriptionBody;
import com.ecommercebackend.exception.ResourceNotFoundException;
import com.ecommercebackend.exception.DuplicateResourceException;
import com.ecommercebackend.exception.UnauthorizedException;
import com.ecommercebackend.model.Description;
import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.Product;
import com.ecommercebackend.model.dao.DescriptionDAO;
import com.ecommercebackend.model.dao.ProductDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for handling product description operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DescriptionService {

    private final DescriptionDAO descriptionDAO;
    private final ProductDAO productDAO;

    private static final String PRODUCT_NOT_FOUND = "Product not found with id: ";
    private static final String DESCRIPTION_NOT_FOUND = "Description not found with id: ";
    private static final String DESCRIPTION_NOT_FOUND_FOR_PRODUCT = "Description not found for product id: ";
    private static final String DUPLICATE_ARTICLE_SKU = "Article SKU already exists: ";
    private static final String DESCRIPTION_ALREADY_EXISTS = "Product already has a description";
    private static final String ADMIN_REQUIRED = "Admin privileges required for this operation";

    @Transactional
    public Description createDescription(DescriptionBody descriptionBody, Long productId, LocalUser user) {
        log.info("Creating description for product id: {} by user: {}", productId, user.getUsername());

        validateAdminUser(user);
        Product product = findProductById(productId);
        validateProductHasNoDescription(product);

        if (descriptionBody.getArticleSku() != null) {
            validateArticleSkuUnique(descriptionBody.getArticleSku());
        }

        Description description = buildDescriptionFromBody(descriptionBody, product);
        Description savedDescription = descriptionDAO.save(description);

        product.setDescription(savedDescription);
        productDAO.save(product);

        log.info("Successfully created description with id: {} for product id: {} by user: {}",
                 savedDescription.getId(), productId, user.getUsername());
        return savedDescription;
    }

    public Description getDescriptionByProductId(Long productId) {
        log.debug("Fetching description for product id: {}", productId);
        return descriptionDAO.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(DESCRIPTION_NOT_FOUND_FOR_PRODUCT + productId));
    }

    public Description getDescriptionById(Long descriptionId) {
        log.debug("Fetching description with id: {}", descriptionId);
        return descriptionDAO.findById(descriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(DESCRIPTION_NOT_FOUND + descriptionId));
    }

    @Transactional
    public Description updateDescription(Long descriptionId, DescriptionBody descriptionBody, LocalUser user) {
        log.info("Updating description with id: {} by user: {}", descriptionId, user.getUsername());

        validateAdminUser(user);
        Description existingDescription = findDescriptionById(descriptionId);

        if (descriptionBody.getArticleSku() != null) {
            validateArticleSkuForUpdate(descriptionBody.getArticleSku(), existingDescription);
        }

        updateDescriptionFromBody(existingDescription, descriptionBody);

        Description updatedDescription = descriptionDAO.save(existingDescription);
        log.info("Successfully updated description with id: {} by user: {}", descriptionId, user.getUsername());
        return updatedDescription;
    }

    @Transactional
    public Description updateDescriptionByProductId(Long productId, DescriptionBody descriptionBody, LocalUser user) {
        log.info("Updating description for product id: {} by user: {}", productId, user.getUsername());

        validateAdminUser(user);
        Description existingDescription = descriptionDAO.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(DESCRIPTION_NOT_FOUND_FOR_PRODUCT + productId));

        return updateDescription(existingDescription.getId(), descriptionBody, user);
    }

    /**
     * Creates or updates description for a product.
     * If description exists - updates it, otherwise creates new one.
     */
    @Transactional
    public Description createOrUpdateDescription(DescriptionBody descriptionBody, Long productId, LocalUser user) {
        log.info("Creating or updating description for product id: {} by user: {}", productId, user.getUsername());

        validateAdminUser(user);
        Optional<Description> existingDescription = descriptionDAO.findByProductId(productId);

        if (existingDescription.isPresent()) {
            Description description = existingDescription.get();

            if (descriptionBody.getArticleSku() != null) {
                validateArticleSkuForUpdate(descriptionBody.getArticleSku(), description);
            }

            updateDescriptionFromBody(description, descriptionBody);
            Description updated = descriptionDAO.save(description);
            log.info("Updated existing description with id: {} by user: {}", updated.getId(), user.getUsername());
            return updated;
        } else {
            return createDescription(descriptionBody, productId, user);
        }
    }

    @Transactional
    public void deleteDescription(Long descriptionId, LocalUser user) {
        log.info("Deleting description with id: {} by user: {}", descriptionId, user.getUsername());

        validateAdminUser(user);
        Description description = findDescriptionById(descriptionId);
        removeDescriptionFromProduct(description);
        descriptionDAO.delete(description);

        log.info("Successfully deleted description with id: {} by user: {}", descriptionId, user.getUsername());
    }

    @Transactional
    public void deleteDescriptionByProductId(Long productId, LocalUser user) {
        log.info("Deleting description for product id: {} by user: {}", productId, user.getUsername());

        validateAdminUser(user);
        Description description = descriptionDAO.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(DESCRIPTION_NOT_FOUND_FOR_PRODUCT + productId));

        deleteDescription(description.getId(), user);
    }

    public boolean descriptionExistsForProduct(Long productId) {
        return descriptionDAO.findByProductId(productId).isPresent();
    }

    /**
     * Get description by article SKU.
     */
    public Description getDescriptionByArticleSku(String articleSku) {
        log.debug("Fetching description by article SKU: {}", articleSku);
        return descriptionDAO.findByArticleSku(articleSku)
                .orElseThrow(() -> new ResourceNotFoundException("Description not found with article SKU: " + articleSku));
    }

    // Private helper methods

    private void validateAdminUser(LocalUser user) {
        if (user == null || user.getRole() == null || !"ADMIN".equals(user.getRole().getValue())) {
            throw new UnauthorizedException(ADMIN_REQUIRED);
        }
    }

    private Product findProductById(Long productId) {
        return productDAO.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(PRODUCT_NOT_FOUND + productId));
    }

    private Description findDescriptionById(Long descriptionId) {
        return descriptionDAO.findById(descriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(DESCRIPTION_NOT_FOUND + descriptionId));
    }

    private void validateProductHasNoDescription(Product product) {
        if (product.getDescription() != null) {
            throw new DuplicateResourceException(DESCRIPTION_ALREADY_EXISTS);
        }
    }

    private void validateArticleSkuUnique(String articleSku) {
        if (articleSku != null && descriptionDAO.existsByArticleSku(articleSku)) {
            throw new DuplicateResourceException(DUPLICATE_ARTICLE_SKU + articleSku);
        }
    }

    private void validateArticleSkuForUpdate(String newArticleSku, Description existingDescription) {
        if (newArticleSku != null &&
            !newArticleSku.equals(existingDescription.getArticleSku()) &&
            descriptionDAO.existsByArticleSku(newArticleSku)) {
            throw new DuplicateResourceException(DUPLICATE_ARTICLE_SKU + newArticleSku);
        }
    }

    private Description buildDescriptionFromBody(DescriptionBody body, Product product) {
        Description description = new Description();
        updateDescriptionFromBody(description, body);
        description.setProduct(product);
        return description;
    }

    private void updateDescriptionFromBody(Description description, DescriptionBody body) {
        if (body.getModel() != null) {
            description.setModel(body.getModel());
        }
        if (body.getArticleSku() != null) {
            description.setArticleSku(body.getArticleSku());
        }
        if (body.getDimensions() != null) {
            description.setDimensions(body.getDimensions());
        }
        if (body.getWeight() != null) {
            description.setWeight(body.getWeight());
        }
        if (body.getColorFinish() != null) {
            description.setColorFinish(body.getColorFinish());
        }
        if (body.getPowerConsumption() != null) {
            description.setPowerConsumption(body.getPowerConsumption());
        }
        if (body.getCapacity() != null) {
            description.setCapacity(body.getCapacity());
        }
        if (body.getMaterials() != null) {
            description.setMaterials(body.getMaterials());
        }
        if (body.getWarranty() != null) {
            description.setWarranty(body.getWarranty());
        }
        if (body.getCountryOfOrigin() != null) {
            description.setCountryOfOrigin(body.getCountryOfOrigin());
        }
    }

    private void removeDescriptionFromProduct(Description description) {
        Product product = description.getProduct();
        if (product != null) {
            product.setDescription(null);
            productDAO.save(product);
        }
    }
}
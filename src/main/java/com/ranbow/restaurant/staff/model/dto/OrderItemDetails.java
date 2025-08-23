package com.ranbow.restaurant.staff.model.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Order Item Details for Staff Operations
 * Contains detailed information about each item in an order
 */
public class OrderItemDetails {
    
    private Long itemId;
    private String name;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String specialRequests;
    private List<String> customizations;
    private String category;
    private int preparationTimeMinutes;
    private boolean isCompleted;
    private boolean requiresSpecialHandling;
    private String kitchenNotes;
    private String allergenInfo;
    
    // Constructors
    public OrderItemDetails() {
        this.isCompleted = false;
        this.requiresSpecialHandling = false;
    }
    
    public OrderItemDetails(Long itemId, String name, int quantity, BigDecimal unitPrice) {
        this();
        this.itemId = itemId;
        this.name = name;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    // Business logic methods
    public void calculateTotalPrice() {
        if (unitPrice != null && quantity > 0) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }
    }
    
    public boolean hasSpecialRequirements() {
        return (specialRequests != null && !specialRequests.trim().isEmpty()) ||
               (customizations != null && !customizations.isEmpty()) ||
               requiresSpecialHandling;
    }
    
    public boolean hasAllergens() {
        return allergenInfo != null && !allergenInfo.trim().isEmpty();
    }
    
    // Getters and Setters
    public Long getItemId() {
        return itemId;
    }
    
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setItemName(String itemName) {
        this.name = itemName;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        calculateTotalPrice();
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateTotalPrice();
    }
    
    public void setPrice(BigDecimal price) {
        this.unitPrice = price;
        calculateTotalPrice();
    }
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public List<String> getCustomizations() {
        return customizations;
    }
    
    public void setCustomizations(List<String> customizations) {
        this.customizations = customizations;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }
    
    public void setPreparationTimeMinutes(int preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }
    
    public boolean isCompleted() {
        return isCompleted;
    }
    
    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }
    
    public boolean isRequiresSpecialHandling() {
        return requiresSpecialHandling;
    }
    
    public void setRequiresSpecialHandling(boolean requiresSpecialHandling) {
        this.requiresSpecialHandling = requiresSpecialHandling;
    }
    
    public String getKitchenNotes() {
        return kitchenNotes;
    }
    
    public void setKitchenNotes(String kitchenNotes) {
        this.kitchenNotes = kitchenNotes;
    }
    
    public String getAllergenInfo() {
        return allergenInfo;
    }
    
    public void setAllergenInfo(String allergenInfo) {
        this.allergenInfo = allergenInfo;
    }
    
    @Override
    public String toString() {
        return "OrderItemDetails{" +
                "itemId=" + itemId +
                ", name='" + name + '\'' +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + totalPrice +
                ", isCompleted=" + isCompleted +
                '}';
    }
}
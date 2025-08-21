package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.MenuDAO;
import com.ranbow.restaurant.models.MenuCategory;
import com.ranbow.restaurant.models.MenuItem;
import com.ranbow.restaurant.api.AdminController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class MenuService {
    
    @Autowired
    private MenuDAO menuDAO;
    
    public MenuItem addMenuItem(String name, String description, BigDecimal price, MenuCategory category) {
        MenuItem newItem = new MenuItem(name, description, price, category);
        // Set preparation times based on category
        switch (category) {
            case APPETIZER -> newItem.setPreparationTime(10);
            case MAIN_COURSE -> newItem.setPreparationTime(25);
            case BEVERAGE -> newItem.setPreparationTime(3);
            case DESSERT -> newItem.setPreparationTime(8);
            default -> newItem.setPreparationTime(15);
        }
        return menuDAO.save(newItem);
    }
    
    public Optional<MenuItem> findMenuItemById(String itemId) {
        return menuDAO.findById(itemId);
    }
    
    public List<MenuItem> getAllMenuItems() {
        return menuDAO.findAll();
    }
    
    public List<MenuItem> getAvailableMenuItems() {
        return menuDAO.findAvailable();
    }
    
    public List<MenuItem> getMenuItemsByCategory(MenuCategory category) {
        return menuDAO.findByCategory(category);
    }
    
    public List<MenuItem> searchMenuItems(String keyword) {
        return menuDAO.searchByKeyword(keyword);
    }
    
    public MenuItem updateMenuItem(String itemId, MenuItem updatedItem) {
        Optional<MenuItem> existingItem = menuDAO.findById(itemId);
        if (existingItem.isPresent()) {
            updatedItem.setItemId(itemId);
            return menuDAO.update(updatedItem);
        }
        throw new IllegalArgumentException("找不到菜單項目，ID: " + itemId);
    }
    
    public boolean setMenuItemAvailability(String itemId, boolean isAvailable) {
        return menuDAO.updateAvailability(itemId, isAvailable);
    }
    
    public boolean removeMenuItem(String itemId) {
        return menuDAO.delete(itemId);
    }
    
    public List<MenuItem> getPopularItems() {
        return menuDAO.findPopularItems();
    }
    
    public int getTotalMenuItems() {
        return menuDAO.countTotal();
    }
    
    public int getAvailableItemsCount() {
        return menuDAO.countAvailable();
    }
    
    // ============ ADMIN-SPECIFIC METHODS ============
    
    /**
     * Create a new menu item (Admin only)
     */
    public MenuItem createMenuItem(String name, String description, double price, MenuCategory category, String imageUrl) {
        MenuItem newItem = new MenuItem(name, description, BigDecimal.valueOf(price), category);
        
        // Set preparation times based on category
        switch (category) {
            case APPETIZER -> newItem.setPreparationTime(10);
            case MAIN_COURSE -> newItem.setPreparationTime(25);
            case BEVERAGE -> newItem.setPreparationTime(3);
            case DESSERT -> newItem.setPreparationTime(8);
            default -> newItem.setPreparationTime(15);
        }
        
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            newItem.setImageUrl(imageUrl);
        }
        
        return menuDAO.save(newItem);
    }
    
    /**
     * Update an existing menu item (Admin only)
     */
    public MenuItem updateMenuItem(String itemId, AdminController.UpdateMenuItemRequest request) {
        Optional<MenuItem> existingItemOpt = menuDAO.findById(itemId);
        
        if (existingItemOpt.isPresent()) {
            MenuItem existingItem = existingItemOpt.get();
            
            // Update fields if provided
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                existingItem.setName(request.getName().trim());
            }
            
            if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
                existingItem.setDescription(request.getDescription().trim());
            }
            
            if (request.getPrice() != null && request.getPrice() > 0) {
                existingItem.setPrice(BigDecimal.valueOf(request.getPrice()));
            }
            
            if (request.getCategory() != null) {
                existingItem.setCategory(request.getCategory());
                // Update preparation time based on new category
                switch (request.getCategory()) {
                    case APPETIZER -> existingItem.setPreparationTime(10);
                    case MAIN_COURSE -> existingItem.setPreparationTime(25);
                    case BEVERAGE -> existingItem.setPreparationTime(3);
                    case DESSERT -> existingItem.setPreparationTime(8);
                    default -> existingItem.setPreparationTime(15);
                }
            }
            
            if (request.getImageUrl() != null) {
                existingItem.setImageUrl(request.getImageUrl());
            }
            
            if (request.getAvailable() != null) {
                existingItem.setAvailable(request.getAvailable());
            }
            
            return menuDAO.update(existingItem);
        }
        
        return null;
    }
    
    /**
     * Delete a menu item (Admin only)
     */
    public boolean deleteMenuItem(String itemId) {
        return menuDAO.delete(itemId);
    }
    
    /**
     * Bulk update menu items (Admin only)
     */
    public Map<String, Object> bulkUpdateMenuItems(AdminController.BulkMenuUpdateRequest request) {
        Map<String, Object> result = new HashMap<>();
        List<String> itemIds = request.getItemIds();
        String operation = request.getOperation();
        Double value = request.getValue();
        
        int successCount = 0;
        int failureCount = 0;
        
        for (String itemId : itemIds) {
            try {
                Optional<MenuItem> itemOpt = menuDAO.findById(itemId);
                if (itemOpt.isPresent()) {
                    MenuItem item = itemOpt.get();
                    
                    switch (operation) {
                        case "price_increase":
                            if (value != null) {
                                double currentPrice = item.getPrice().doubleValue();
                                double newPrice = currentPrice * (1 + value / 100);
                                item.setPrice(BigDecimal.valueOf(newPrice));
                                menuDAO.update(item);
                                successCount++;
                            }
                            break;
                            
                        case "price_decrease":
                            if (value != null) {
                                double currentPrice = item.getPrice().doubleValue();
                                double newPrice = currentPrice * (1 - value / 100);
                                item.setPrice(BigDecimal.valueOf(Math.max(newPrice, 0)));
                                menuDAO.update(item);
                                successCount++;
                            }
                            break;
                            
                        case "set_available":
                            item.setAvailable(true);
                            menuDAO.update(item);
                            successCount++;
                            break;
                            
                        case "set_unavailable":
                            item.setAvailable(false);
                            menuDAO.update(item);
                            successCount++;
                            break;
                            
                        default:
                            failureCount++;
                            break;
                    }
                } else {
                    failureCount++;
                }
            } catch (Exception e) {
                failureCount++;
            }
        }
        
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("totalProcessed", itemIds.size());
        result.put("operation", operation);
        
        return result;
    }
    
    
    /**
     * Update menu item price (Admin only)
     */
    public boolean updateMenuItemPrice(String itemId, double newPrice) {
        Optional<MenuItem> itemOpt = menuDAO.findById(itemId);
        if (itemOpt.isPresent() && newPrice > 0) {
            MenuItem item = itemOpt.get();
            item.setPrice(BigDecimal.valueOf(newPrice));
            menuDAO.update(item);
            return true;
        }
        return false;
    }
}
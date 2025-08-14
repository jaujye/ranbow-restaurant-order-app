package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.MenuDAO;
import com.ranbow.restaurant.models.MenuCategory;
import com.ranbow.restaurant.models.MenuItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
}
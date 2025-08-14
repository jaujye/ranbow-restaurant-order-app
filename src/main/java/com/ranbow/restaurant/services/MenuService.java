package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.MenuCategory;
import com.ranbow.restaurant.models.MenuItem;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MenuService {
    private List<MenuItem> menuItems;
    
    public MenuService() {
        this.menuItems = new ArrayList<>();
        initializeDefaultMenu();
    }
    
    private void initializeDefaultMenu() {
        // Appetizers
        menuItems.add(new MenuItem("炸雞翅", "酥脆多汁的炸雞翅", new BigDecimal("180"), MenuCategory.APPETIZER));
        menuItems.add(new MenuItem("薯條", "金黃酥脆薯條", new BigDecimal("80"), MenuCategory.APPETIZER));
        
        // Main Courses
        menuItems.add(new MenuItem("牛肉漢堡", "經典牛肉漢堡配薯條", new BigDecimal("320"), MenuCategory.MAIN_COURSE));
        menuItems.add(new MenuItem("雞腿排", "香煎雞腿排佐蔬菜", new BigDecimal("280"), MenuCategory.MAIN_COURSE));
        menuItems.add(new MenuItem("義大利麵", "奶油培根義大利麵", new BigDecimal("250"), MenuCategory.MAIN_COURSE));
        
        // Beverages
        menuItems.add(new MenuItem("可樂", "冰涼可口可樂", new BigDecimal("50"), MenuCategory.BEVERAGE));
        menuItems.add(new MenuItem("咖啡", "香濃美式咖啡", new BigDecimal("90"), MenuCategory.BEVERAGE));
        menuItems.add(new MenuItem("柳橙汁", "新鮮現榨柳橙汁", new BigDecimal("80"), MenuCategory.BEVERAGE));
        
        // Desserts
        menuItems.add(new MenuItem("巧克力蛋糕", "濃郁巧克力蛋糕", new BigDecimal("120"), MenuCategory.DESSERT));
        menuItems.add(new MenuItem("冰淇淋", "香草冰淇淋", new BigDecimal("60"), MenuCategory.DESSERT));
        
        // Set preparation times
        setPreparationTimes();
    }
    
    private void setPreparationTimes() {
        for (MenuItem item : menuItems) {
            switch (item.getCategory()) {
                case APPETIZER -> item.setPreparationTime(10);
                case MAIN_COURSE -> item.setPreparationTime(25);
                case BEVERAGE -> item.setPreparationTime(3);
                case DESSERT -> item.setPreparationTime(8);
                default -> item.setPreparationTime(15);
            }
        }
    }
    
    public MenuItem addMenuItem(String name, String description, BigDecimal price, MenuCategory category) {
        MenuItem newItem = new MenuItem(name, description, price, category);
        menuItems.add(newItem);
        return newItem;
    }
    
    public Optional<MenuItem> findMenuItemById(String itemId) {
        return menuItems.stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst();
    }
    
    public List<MenuItem> getAllMenuItems() {
        return new ArrayList<>(menuItems);
    }
    
    public List<MenuItem> getAvailableMenuItems() {
        return menuItems.stream()
                .filter(MenuItem::isAvailable)
                .toList();
    }
    
    public List<MenuItem> getMenuItemsByCategory(MenuCategory category) {
        return menuItems.stream()
                .filter(item -> item.getCategory() == category && item.isAvailable())
                .toList();
    }
    
    public List<MenuItem> searchMenuItems(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return menuItems.stream()
                .filter(item -> item.isAvailable() && 
                       (item.getName().toLowerCase().contains(lowerKeyword) ||
                        item.getDescription().toLowerCase().contains(lowerKeyword)))
                .toList();
    }
    
    public MenuItem updateMenuItem(String itemId, MenuItem updatedItem) {
        Optional<MenuItem> existingItem = findMenuItemById(itemId);
        if (existingItem.isPresent()) {
            MenuItem item = existingItem.get();
            item.setName(updatedItem.getName());
            item.setDescription(updatedItem.getDescription());
            item.setPrice(updatedItem.getPrice());
            item.setCategory(updatedItem.getCategory());
            item.setImageUrl(updatedItem.getImageUrl());
            item.setPreparationTime(updatedItem.getPreparationTime());
            return item;
        }
        throw new IllegalArgumentException("找不到菜單項目，ID: " + itemId);
    }
    
    public boolean setMenuItemAvailability(String itemId, boolean isAvailable) {
        Optional<MenuItem> item = findMenuItemById(itemId);
        if (item.isPresent()) {
            item.get().setAvailable(isAvailable);
            return true;
        }
        return false;
    }
    
    public boolean removeMenuItem(String itemId) {
        return menuItems.removeIf(item -> item.getItemId().equals(itemId));
    }
    
    public List<MenuItem> getPopularItems() {
        // In a real application, this would be based on order statistics
        // For demo purposes, return items from main course and appetizer categories
        return menuItems.stream()
                .filter(item -> (item.getCategory() == MenuCategory.MAIN_COURSE || 
                               item.getCategory() == MenuCategory.APPETIZER) && 
                               item.isAvailable())
                .limit(5)
                .toList();
    }
    
    public int getTotalMenuItems() {
        return menuItems.size();
    }
    
    public int getAvailableItemsCount() {
        return (int) menuItems.stream()
                .filter(MenuItem::isAvailable)
                .count();
    }
}
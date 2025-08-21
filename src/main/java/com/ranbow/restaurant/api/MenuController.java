package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.MenuCategory;
import com.ranbow.restaurant.models.MenuItem;
import com.ranbow.restaurant.services.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/menu")
@CrossOrigin(origins = "*")
public class MenuController {
    
    @Autowired
    private MenuService menuService;
    
    @PostMapping
    public ResponseEntity<?> addMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        try {
            MenuItem menuItem = menuService.addMenuItem(
                    request.getName(),
                    request.getDescription(),
                    request.getPrice(),
                    request.getCategory());
            return ResponseEntity.status(HttpStatus.CREATED).body(menuItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{itemId}")
    public ResponseEntity<?> getMenuItem(@PathVariable String itemId) {
        Optional<MenuItem> item = menuService.findMenuItemById(itemId);
        if (item.isPresent()) {
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        List<MenuItem> items = menuService.getAllMenuItems();
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<MenuItem>> getAvailableMenuItems() {
        List<MenuItem> items = menuService.getAvailableMenuItems();
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByCategory(@PathVariable MenuCategory category) {
        List<MenuItem> items = menuService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<MenuItem>> searchMenuItems(@RequestParam("keyword") String keyword) {
        List<MenuItem> items = menuService.searchMenuItems(keyword);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<MenuItem>> getPopularItems() {
        List<MenuItem> items = menuService.getPopularItems();
        return ResponseEntity.ok(items);
    }
    
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String itemId, 
                                          @Valid @RequestBody MenuItem updatedItem) {
        try {
            MenuItem item = menuService.updateMenuItem(itemId, updatedItem);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{itemId}/availability")
    public ResponseEntity<?> setMenuItemAvailability(@PathVariable String itemId, 
                                                    @RequestBody AvailabilityRequest request) {
        boolean success = menuService.setMenuItemAvailability(itemId, request.isAvailable());
        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "message", "Availability updated",
                    "available", request.isAvailable()
            ));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeMenuItem(@PathVariable String itemId) {
        boolean success = menuService.removeMenuItem(itemId);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Menu item removed"));
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getMenuStats() {
        return ResponseEntity.ok(Map.of(
                "totalItems", menuService.getTotalMenuItems(),
                "availableItems", menuService.getAvailableItemsCount(),
                "categories", MenuCategory.values()
        ));
    }
    
    // DTO Classes
    public static class CreateMenuItemRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private MenuCategory category;
        private String imageUrl;
        private int preparationTime = 15;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        
        public MenuCategory getCategory() { return category; }
        public void setCategory(MenuCategory category) { this.category = category; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        
        public int getPreparationTime() { return preparationTime; }
        public void setPreparationTime(int preparationTime) { this.preparationTime = preparationTime; }
    }
    
    public static class AvailabilityRequest {
        private boolean available;
        
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}
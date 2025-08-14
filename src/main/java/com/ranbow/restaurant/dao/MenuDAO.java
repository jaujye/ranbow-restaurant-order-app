package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.MenuCategory;
import com.ranbow.restaurant.models.MenuItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class MenuDAO {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final String INSERT_MENU_ITEM = """
        INSERT INTO menu_items (item_id, name, description, price, category, is_available, 
                               image_url, preparation_time, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?::menu_category, ?, ?, ?, ?, ?)
        """;
    
    private static final String SELECT_MENU_ITEM_BY_ID = """
        SELECT item_id, name, description, price, category, is_available, 
               image_url, preparation_time, created_at, updated_at 
        FROM menu_items WHERE item_id = ?
        """;
    
    private static final String SELECT_ALL_MENU_ITEMS = """
        SELECT item_id, name, description, price, category, is_available, 
               image_url, preparation_time, created_at, updated_at 
        FROM menu_items ORDER BY category, name
        """;
    
    private static final String SELECT_AVAILABLE_MENU_ITEMS = """
        SELECT item_id, name, description, price, category, is_available, 
               image_url, preparation_time, created_at, updated_at 
        FROM menu_items WHERE is_available = true ORDER BY category, name
        """;
    
    private static final String SELECT_MENU_ITEMS_BY_CATEGORY = """
        SELECT item_id, name, description, price, category, is_available, 
               image_url, preparation_time, created_at, updated_at 
        FROM menu_items WHERE category = ?::menu_category AND is_available = true 
        ORDER BY name
        """;
    
    private static final String SEARCH_MENU_ITEMS = """
        SELECT item_id, name, description, price, category, is_available, 
               image_url, preparation_time, created_at, updated_at 
        FROM menu_items 
        WHERE is_available = true AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)) 
        ORDER BY name
        """;
    
    private static final String UPDATE_MENU_ITEM = """
        UPDATE menu_items 
        SET name = ?, description = ?, price = ?, category = ?::menu_category, 
            image_url = ?, preparation_time = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE item_id = ?
        """;
    
    private static final String UPDATE_MENU_ITEM_AVAILABILITY = """
        UPDATE menu_items SET is_available = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE item_id = ?
        """;
    
    private static final String DELETE_MENU_ITEM = """
        DELETE FROM menu_items WHERE item_id = ?
        """;
    
    private static final String COUNT_TOTAL_MENU_ITEMS = """
        SELECT COUNT(*) FROM menu_items
        """;
    
    private static final String COUNT_AVAILABLE_MENU_ITEMS = """
        SELECT COUNT(*) FROM menu_items WHERE is_available = true
        """;
    
    private static final String SELECT_POPULAR_ITEMS = """
        SELECT mi.item_id, mi.name, mi.description, mi.price, mi.category, mi.is_available, 
               mi.image_url, mi.preparation_time, mi.created_at, mi.updated_at 
        FROM menu_items mi 
        WHERE mi.is_available = true AND (mi.category = 'MAIN_COURSE' OR mi.category = 'APPETIZER') 
        ORDER BY mi.name 
        LIMIT 5
        """;
    
    private final RowMapper<MenuItem> menuItemRowMapper = new RowMapper<MenuItem>() {
        @Override
        public MenuItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            MenuItem item = new MenuItem();
            item.setItemId(rs.getString("item_id"));
            item.setName(rs.getString("name"));
            item.setDescription(rs.getString("description"));
            item.setPrice(rs.getBigDecimal("price"));
            item.setCategory(MenuCategory.valueOf(rs.getString("category")));
            item.setAvailable(rs.getBoolean("is_available"));
            item.setImageUrl(rs.getString("image_url"));
            item.setPreparationTime(rs.getInt("preparation_time"));
            
            // Handle timestamps
            java.sql.Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                item.setCreatedAt(createdTimestamp.toLocalDateTime());
            }
            
            java.sql.Timestamp updatedTimestamp = rs.getTimestamp("updated_at");
            if (updatedTimestamp != null) {
                item.setUpdatedAt(updatedTimestamp.toLocalDateTime());
            }
            
            return item;
        }
    };
    
    public MenuItem save(MenuItem menuItem) {
        jdbcTemplate.update(INSERT_MENU_ITEM,
                menuItem.getItemId(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getCategory().name(),
                menuItem.isAvailable(),
                menuItem.getImageUrl(),
                menuItem.getPreparationTime(),
                java.sql.Timestamp.valueOf(menuItem.getCreatedAt()),
                java.sql.Timestamp.valueOf(menuItem.getUpdatedAt()));
        return menuItem;
    }
    
    public Optional<MenuItem> findById(String itemId) {
        try {
            MenuItem item = jdbcTemplate.queryForObject(SELECT_MENU_ITEM_BY_ID, menuItemRowMapper, itemId);
            return Optional.of(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public List<MenuItem> findAll() {
        return jdbcTemplate.query(SELECT_ALL_MENU_ITEMS, menuItemRowMapper);
    }
    
    public List<MenuItem> findAvailable() {
        return jdbcTemplate.query(SELECT_AVAILABLE_MENU_ITEMS, menuItemRowMapper);
    }
    
    public List<MenuItem> findByCategory(MenuCategory category) {
        return jdbcTemplate.query(SELECT_MENU_ITEMS_BY_CATEGORY, menuItemRowMapper, category.name());
    }
    
    public List<MenuItem> searchByKeyword(String keyword) {
        String searchPattern = "%" + keyword + "%";
        return jdbcTemplate.query(SEARCH_MENU_ITEMS, menuItemRowMapper, searchPattern, searchPattern);
    }
    
    public MenuItem update(MenuItem menuItem) {
        int updated = jdbcTemplate.update(UPDATE_MENU_ITEM,
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getCategory().name(),
                menuItem.getImageUrl(),
                menuItem.getPreparationTime(),
                menuItem.getItemId());
        
        if (updated == 0) {
            throw new RuntimeException("Menu item not found: " + menuItem.getItemId());
        }
        return menuItem;
    }
    
    public boolean updateAvailability(String itemId, boolean isAvailable) {
        int updated = jdbcTemplate.update(UPDATE_MENU_ITEM_AVAILABILITY, isAvailable, itemId);
        return updated > 0;
    }
    
    public boolean delete(String itemId) {
        int deleted = jdbcTemplate.update(DELETE_MENU_ITEM, itemId);
        return deleted > 0;
    }
    
    public int countTotal() {
        Integer count = jdbcTemplate.queryForObject(COUNT_TOTAL_MENU_ITEMS, Integer.class);
        return count != null ? count : 0;
    }
    
    public int countAvailable() {
        Integer count = jdbcTemplate.queryForObject(COUNT_AVAILABLE_MENU_ITEMS, Integer.class);
        return count != null ? count : 0;
    }
    
    public List<MenuItem> findPopularItems() {
        return jdbcTemplate.query(SELECT_POPULAR_ITEMS, menuItemRowMapper);
    }
}
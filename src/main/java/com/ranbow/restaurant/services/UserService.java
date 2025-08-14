package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.User;
import com.ranbow.restaurant.models.UserRole;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserService {
    private List<User> users;
    
    public UserService() {
        this.users = new ArrayList<>();
        initializeDefaultUsers();
    }
    
    private void initializeDefaultUsers() {
        // Create default admin user
        User admin = new User("admin", "admin@ranbow.com", "0912345678", UserRole.ADMIN);
        users.add(admin);
        
        // Create default staff user
        User staff = new User("staff", "staff@ranbow.com", "0987654321", UserRole.STAFF);
        users.add(staff);
    }
    
    public User createUser(String username, String email, String phoneNumber, UserRole role) {
        // Check if user already exists
        if (findUserByEmail(email).isPresent()) {
            throw new IllegalArgumentException("使用者已存在，Email: " + email);
        }
        
        User newUser = new User(username, email, phoneNumber, role);
        users.add(newUser);
        return newUser;
    }
    
    public Optional<User> findUserById(String userId) {
        return users.stream()
                .filter(user -> user.getUserId().equals(userId))
                .findFirst();
    }
    
    public Optional<User> findUserByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }
    
    public List<User> getAllUsers() {
        return new ArrayList<>(users);
    }
    
    public List<User> getUsersByRole(UserRole role) {
        return users.stream()
                .filter(user -> user.getRole() == role)
                .toList();
    }
    
    public boolean authenticateUser(String email, String password) {
        // In a real application, you would hash and verify passwords
        // For this demo, we'll use a simple check
        Optional<User> user = findUserByEmail(email);
        if (user.isPresent() && user.get().isActive()) {
            user.get().setLastLoginAt(LocalDateTime.now());
            return true;
        }
        return false;
    }
    
    public User updateUser(String userId, User updatedUser) {
        Optional<User> existingUser = findUserById(userId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setRole(updatedUser.getRole());
            return user;
        }
        throw new IllegalArgumentException("找不到使用者，ID: " + userId);
    }
    
    public boolean deactivateUser(String userId) {
        Optional<User> user = findUserById(userId);
        if (user.isPresent()) {
            user.get().setActive(false);
            return true;
        }
        return false;
    }
    
    public boolean activateUser(String userId) {
        Optional<User> user = findUserById(userId);
        if (user.isPresent()) {
            user.get().setActive(true);
            return true;
        }
        return false;
    }
    
    public int getTotalActiveUsers() {
        return (int) users.stream()
                .filter(User::isActive)
                .count();
    }
    
    public int getTotalCustomers() {
        return (int) users.stream()
                .filter(user -> user.getRole() == UserRole.CUSTOMER && user.isActive())
                .count();
    }
}
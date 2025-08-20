package com.ranbow.restaurant.services;

import com.ranbow.restaurant.api.UserController;
import com.ranbow.restaurant.dao.UserDAO;
import com.ranbow.restaurant.models.User;
import com.ranbow.restaurant.models.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserDAO userDAO;
    
    public User createUser(String username, String email, String phoneNumber, String password, UserRole role) {
        // Check if user already exists
        if (userDAO.existsByEmail(email)) {
            throw new IllegalArgumentException("使用者已存在，Email: " + email);
        }
        
        // For this demo, we'll create user without password hashing
        // In a real application, you would hash the password here
        User newUser = new User(username, email, phoneNumber, role);
        return userDAO.save(newUser);
    }
    
    public Optional<User> findUserById(String userId) {
        return userDAO.findById(userId);
    }
    
    public Optional<User> findUserByEmail(String email) {
        return userDAO.findByEmail(email);
    }
    
    public List<User> getAllUsers() {
        return userDAO.findAll();
    }
    
    public List<User> getUsersByRole(UserRole role) {
        return userDAO.findByRole(role);
    }
    
    public boolean authenticateUser(String email, String password) {
        // In a real application, you would hash and verify passwords
        // For this demo, we'll use a simple check
        Optional<User> user = userDAO.findByEmail(email);
        if (user.isPresent() && user.get().isActive()) {
            userDAO.updateLastLogin(user.get().getUserId(), LocalDateTime.now());
            return true;
        }
        return false;
    }
    
    public User updateUser(String userId, User updatedUser) {
        Optional<User> existingUser = userDAO.findById(userId);
        if (existingUser.isPresent()) {
            updatedUser.setUserId(userId);
            return userDAO.update(updatedUser);
        }
        throw new IllegalArgumentException("找不到使用者，ID: " + userId);
    }
    
    public boolean deactivateUser(String userId) {
        return userDAO.updateActiveStatus(userId, false);
    }
    
    public boolean activateUser(String userId) {
        return userDAO.updateActiveStatus(userId, true);
    }
    
    public int getTotalActiveUsers() {
        return userDAO.countActiveUsers();
    }
    
    public int getTotalCustomers() {
        return userDAO.countCustomers();
    }

    public User updateUserProfile(String userId, UserController.UpdateProfileRequest request) {
        Optional<User> userOpt = userDAO.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
                user.setUsername(request.getUsername().trim());
            }
            
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                user.setPhoneNumber(request.getPhoneNumber().trim());
            }
            
            if (request.getBirthday() != null && !request.getBirthday().trim().isEmpty()) {
                try {
                    user.setBirthday(LocalDate.parse(request.getBirthday()));
                } catch (Exception e) {
                    throw new IllegalArgumentException("生日日期格式錯誤");
                }
            }
            
            if (request.getAvatarUrl() != null) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            
            return userDAO.update(user);
        }
        throw new IllegalArgumentException("找不到使用者，ID: " + userId);
    }

    public boolean changePassword(String userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userDAO.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // 簡單密碼驗證 - 實際應用中應該使用加密密碼比較
            if (authenticateUser(user.getEmail(), currentPassword)) {
                // 這裡應該加密新密碼並保存
                // 為了演示，直接返回成功
                return true;
            }
        }
        return false;
    }
}
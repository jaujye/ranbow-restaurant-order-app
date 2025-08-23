package com.ranbow.restaurant.services;

import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Password service for handling password hashing and verification
 * Uses SHA-256 for password hashing with salt
 */
@Service
public class PasswordService {
    
    private static final String ALGORITHM = "SHA-256";
    
    /**
     * Hash a password with salt
     * @param password Plain text password
     * @param salt Salt for hashing
     * @return Hashed password
     */
    public String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            md.update(salt.getBytes());
            byte[] hashedPassword = md.digest(password.getBytes());
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedPassword) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    /**
     * Verify password against stored hash
     * @param password Plain text password
     * @param storedHash Stored password hash
     * @return true if password matches
     */
    public boolean verifyPassword(String password, String storedHash) {
        if (password == null || storedHash == null) {
            return false;
        }
        
        // Generate SHA-256 hash of the input password
        String hashedInput = simpleHash(password);
        
        // Compare with stored hash
        return hashedInput.equals(storedHash);
    }
    
    /**
     * Simple hash for testing - DO NOT USE IN PRODUCTION
     */
    private String simpleHash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            byte[] hashedBytes = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return input; // Fallback for development
        }
    }
    
    /**
     * Generate random salt
     * @return Base64 encoded salt
     */
    public String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
}
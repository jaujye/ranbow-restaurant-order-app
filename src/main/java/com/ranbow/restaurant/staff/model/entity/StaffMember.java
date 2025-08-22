package com.ranbow.restaurant.staff.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Staff Member Entity for Restaurant Staff Management System
 * Represents individual staff members with authentication and role management
 */
@Entity
@Table(name = "staff_members", indexes = {
    @Index(name = "idx_employee_number", columnList = "employeeNumber", unique = true),
    @Index(name = "idx_staff_role", columnList = "role"),
    @Index(name = "idx_is_active", columnList = "isActive"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
public class StaffMember {
    
    @Id
    @Column(name = "staff_id", updatable = false, nullable = false)
    private String staffId;
    
    @NotBlank(message = "Employee number is required")
    @Size(min = 3, max = 10, message = "Employee number must be between 3 and 10 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Employee number must contain only uppercase letters and numbers")
    @Column(name = "employee_number", unique = true, nullable = false, length = 10)
    private String employeeNumber;
    
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @NotNull(message = "Role is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private StaffRole role;
    
    @ElementCollection(targetClass = StaffPermission.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
        name = "staff_permissions",
        joinColumns = @JoinColumn(name = "staff_id"),
        indexes = @Index(name = "idx_staff_permissions", columnList = "staff_id")
    )
    @Column(name = "permission", length = 30)
    private Set<StaffPermission> permissions;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "current_device_id", length = 255)
    private String currentDeviceId;
    
    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;
    
    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;
    
    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    // Constructors
    public StaffMember() {
        this.staffId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.passwordChangedAt = LocalDateTime.now();
    }
    
    public StaffMember(String employeeNumber, String fullName, String password, StaffRole role) {
        this();
        this.employeeNumber = employeeNumber;
        this.fullName = fullName;
        this.setPassword(password);
        this.role = role;
    }
    
    // Business Methods
    public void setPassword(String plainPassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        this.passwordHash = encoder.encode(plainPassword);
        this.passwordChangedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean checkPassword(String plainPassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(plainPassword, this.passwordHash);
    }
    
    public void recordLogin(String deviceId) {
        this.lastLoginAt = LocalDateTime.now();
        this.currentDeviceId = deviceId;
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordFailedLogin() {
        this.failedLoginAttempts++;
        this.updatedAt = LocalDateTime.now();
        
        // Lock account after 5 failed attempts for 15 minutes
        if (this.failedLoginAttempts >= 5) {
            this.accountLockedUntil = LocalDateTime.now().plusMinutes(15);
        }
    }
    
    public boolean isAccountLocked() {
        if (accountLockedUntil == null) return false;
        return LocalDateTime.now().isBefore(accountLockedUntil);
    }
    
    public void unlockAccount() {
        this.accountLockedUntil = null;
        this.failedLoginAttempts = 0;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean hasPermission(StaffPermission permission) {
        return permissions != null && permissions.contains(permission);
    }
    
    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void deactivate() {
        this.isActive = false;
        this.currentDeviceId = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getEmployeeNumber() {
        return employeeNumber;
    }
    
    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public StaffRole getRole() {
        return role;
    }
    
    public void setRole(StaffRole role) {
        this.role = role;
    }
    
    public Set<StaffPermission> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(Set<StaffPermission> permissions) {
        this.permissions = permissions;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }
    
    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    
    public String getCurrentDeviceId() {
        return currentDeviceId;
    }
    
    public void setCurrentDeviceId(String currentDeviceId) {
        this.currentDeviceId = currentDeviceId;
    }
    
    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }
    
    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }
    
    public LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }
    
    public void setAccountLockedUntil(LocalDateTime accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }
    
    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }
    
    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Long getVersion() {
        return version;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
    
    @Override
    public String toString() {
        return "StaffMember{" +
                "staffId='" + staffId + '\'' +
                ", employeeNumber='" + employeeNumber + '\'' +
                ", fullName='" + fullName + '\'' +
                ", role=" + role +
                ", isActive=" + isActive +
                ", lastLoginAt=" + lastLoginAt +
                '}';
    }
}
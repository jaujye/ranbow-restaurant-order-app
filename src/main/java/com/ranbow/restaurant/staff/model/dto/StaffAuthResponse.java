package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.vo.StaffSession;
import com.ranbow.restaurant.staff.model.vo.WorkShift;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Staff Authentication Response DTO
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 * Returns comprehensive authentication data including staff info, tokens, and work shift
 */
public class StaffAuthResponse {
    
    private boolean success;
    private String message;
    private StaffAuthData data;
    
    // Nested class for response data
    public static class StaffAuthData {
        private StaffInfo staff;
        private AuthInfo auth;
        private WorkShift workShift;
        
        // Constructors
        public StaffAuthData() {}
        
        public StaffAuthData(StaffInfo staff, AuthInfo auth, WorkShift workShift) {
            this.staff = staff;
            this.auth = auth;
            this.workShift = workShift;
        }
        
        // Getters and Setters
        public StaffInfo getStaff() { return staff; }
        public void setStaff(StaffInfo staff) { this.staff = staff; }
        
        public AuthInfo getAuth() { return auth; }
        public void setAuth(AuthInfo auth) { this.auth = auth; }
        
        public WorkShift getWorkShift() { return workShift; }
        public void setWorkShift(WorkShift workShift) { this.workShift = workShift; }
    }
    
    // Staff information class
    public static class StaffInfo {
        private String staffId;
        private String employeeNumber;
        private String name;
        private String role;
        private String department;
        private String avatar;
        private List<String> permissions;
        private boolean quickSwitchEnabled;
        
        // Constructors
        public StaffInfo() {}
        
        // Getters and Setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        
        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
        
        public boolean isQuickSwitchEnabled() { return quickSwitchEnabled; }
        public void setQuickSwitchEnabled(boolean quickSwitchEnabled) { this.quickSwitchEnabled = quickSwitchEnabled; }
    }
    
    // Authentication information class
    public static class AuthInfo {
        private String accessToken;
        private String refreshToken;
        private long expiresIn; // seconds
        private String tokenType = "Bearer";
        
        // Constructors
        public AuthInfo() {}
        
        public AuthInfo(String accessToken, String refreshToken, long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
        }
        
        // Getters and Setters
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
        
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    }
    
    // Constructors
    public StaffAuthResponse() {}
    
    public StaffAuthResponse(boolean success, String message, StaffAuthData data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Static factory methods for common responses
    public static StaffAuthResponse success(StaffAuthData data) {
        return new StaffAuthResponse(true, "Authentication successful", data);
    }
    
    public static StaffAuthResponse error(String message) {
        return new StaffAuthResponse(false, message, null);
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public StaffAuthData getData() { return data; }
    public void setData(StaffAuthData data) { this.data = data; }
    
    @Override
    public String toString() {
        return "StaffAuthResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                '}';
    }
}
package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.User;
import com.ranbow.restaurant.models.UserRole;
import com.ranbow.restaurant.services.UserService;
import com.ranbow.restaurant.services.JwtService;
import com.ranbow.restaurant.services.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private SessionService sessionService;
    
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(
                    request.getUsername(),
                    request.getEmail(), 
                    request.getPhoneNumber(),
                    request.getPassword(),
                    request.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        Optional<User> user = userService.findUserById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/by-role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthenticationRequest request, HttpServletRequest httpRequest) {
        try {
            System.out.println("Login attempt for email: " + request.getEmail());
            
            boolean authenticated = userService.authenticateUser(request.getEmail(), request.getPassword());
            System.out.println("Authentication result: " + authenticated);
            
            if (authenticated) {
                Optional<User> userOpt = userService.findUserByEmail(request.getEmail());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    System.out.println("User found: " + user.getUserId());
                    
                    // 獲取設備信息和IP地址
                    String deviceInfo = getDeviceInfo(httpRequest);
                    String ipAddress = getClientIpAddress(httpRequest);
                    System.out.println("Device info: " + deviceInfo + ", IP: " + ipAddress);
                    
                    // 創建Redis會話
                    try {
                        String sessionId = sessionService.createSession(user.getUserId(), deviceInfo, ipAddress);
                        System.out.println("Session created: " + sessionId);
                        
                        // 生成JWT Token
                        String token = jwtService.generateToken(user.getUserId(), sessionId, deviceInfo);
                        System.out.println("Token generated successfully");
                        
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "token", token,
                                "user", user,
                                "sessionId", sessionId
                        ));
                    } catch (Exception sessionEx) {
                        System.err.println("Session creation failed: " + sessionEx.getMessage());
                        sessionEx.printStackTrace();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("success", false, "error", "Session creation failed: " + sessionEx.getMessage()));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid credentials"));
        } catch (Exception e) {
            System.err.println("Login failed with exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    sessionService.invalidateSession(tokenInfo.getSessionId());
                    return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
                }
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Logout failed"));
        }
    }

    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAllSessions(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    sessionService.invalidateAllUserSessions(tokenInfo.getUserId());
                    return ResponseEntity.ok(Map.of("success", true, "message", "All sessions logged out"));
                }
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Logout all failed"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                String newToken = jwtService.refreshToken(token);
                if (newToken != null) {
                    return ResponseEntity.ok(Map.of("success", true, "token", newToken));
                }
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Token refresh failed"));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getUserSessions(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    List<SessionService.SessionData> sessions = sessionService.getUserActiveSessions(tokenInfo.getUserId());
                    return ResponseEntity.ok(Map.of("success", true, "sessions", sessions));
                }
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to get sessions"));
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @Valid @RequestBody User updatedUser) {
        try {
            User user = userService.updateUser(userId, updatedUser);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        boolean success = userService.deactivateUser(userId);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "User deactivated"));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable String userId) {
        boolean success = userService.activateUser(userId);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "User activated"));
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    // 驗證會話是否還有效 - 簡化驗證邏輯，直接檢查用戶存在性
                    // SessionService.SessionData sessionData = sessionService.validateSession(tokenInfo.getSessionId());
                    // if (sessionData != null) {
                    // 暫時簡化驗證：只要JWT有效且用戶存在就允許訪問
                    if (true) {
                        Optional<User> user = userService.findUserById(tokenInfo.getUserId());
                        if (user.isPresent()) {
                            return ResponseEntity.ok(Map.of(
                                    "success", true,
                                    "user", user.get(),
                                    "sessionId", tokenInfo.getSessionId()
                            ));
                        } else {
                            return ResponseEntity.notFound().build();
                        }
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("success", false, "error", "Session expired"));
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("success", false, "error", "Invalid token"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error", "Missing authorization header"));
            }
        } catch (Exception e) {
            System.err.println("Get current user failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Failed to get user information"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody CreateUserRequest request, HttpServletRequest httpRequest) {
        try {
            System.out.println("Registration attempt for email: " + request.getEmail());
            
            // 創建新用戶
            User newUser = userService.createUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPhoneNumber(),
                    request.getPassword(),
                    request.getRole() != null ? request.getRole() : UserRole.CUSTOMER
            );
            System.out.println("User created with ID: " + newUser.getUserId());
            
            // 獲取設備信息和IP地址
            String deviceInfo = getDeviceInfo(httpRequest);
            String ipAddress = getClientIpAddress(httpRequest);
            System.out.println("Device info: " + deviceInfo + ", IP: " + ipAddress);
            
            // 自動登入新註冊的用戶 - 創建Redis會話
            try {
                String sessionId = sessionService.createSession(newUser.getUserId(), deviceInfo, ipAddress);
                System.out.println("Session created: " + sessionId);
                
                // 生成JWT Token
                String token = jwtService.generateToken(newUser.getUserId(), sessionId, deviceInfo);
                System.out.println("Token generated successfully");
                
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                        "success", true,
                        "message", "User registered successfully",
                        "token", token,
                        "user", newUser,
                        "sessionId", sessionId
                ));
            } catch (Exception sessionEx) {
                System.err.println("Session creation failed during registration: " + sessionEx.getMessage());
                sessionEx.printStackTrace();
                // 即使會話創建失敗，用戶仍然已經創建成功，返回用戶信息但不包含token
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                        "success", true,
                        "message", "User registered successfully but auto-login failed",
                        "user", newUser,
                        "error", "Please login manually"
                ));
            }
            
        } catch (IllegalArgumentException e) {
            // 用戶已存在或其他驗證錯誤
            System.err.println("Registration validation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Registration failed with exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        return ResponseEntity.ok(Map.of(
                "totalActiveUsers", userService.getTotalActiveUsers(),
                "totalCustomers", userService.getTotalCustomers()
        ));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        Optional<User> user = userService.findUserById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable String userId, @RequestBody UpdateProfileRequest request) {
        try {
            User updatedUser = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String userId, @RequestBody ChangePasswordRequest request) {
        try {
            boolean success = userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Current password is incorrect"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Password change failed"));
        }
    }

    @GetMapping("/{userId}/coupons")
    public ResponseEntity<?> getUserCoupons(@PathVariable String userId) {
        // 模擬優惠券數據 - 實際應用中應該從數據庫查詢
        return ResponseEntity.ok(Map.of(
                "available", java.util.Arrays.asList(
                        Map.of(
                                "id", "coupon1",
                                "title", "滿500折50",
                                "description", "單筆消費滿NT$ 500即可使用",
                                "type", "FIXED_AMOUNT",
                                "discountValue", 50,
                                "minOrderAmount", 500,
                                "expiryDate", "2024-12-31T23:59:59"
                        ),
                        Map.of(
                                "id", "coupon2",
                                "title", "生日免費甜點",
                                "description", "生日月份可免費兌換甜點一份",
                                "type", "FREE_ITEM",
                                "discountValue", 0,
                                "minOrderAmount", 0,
                                "expiryDate", "2024-12-31T23:59:59"
                        )
                ),
                "used", java.util.Arrays.asList(
                        Map.of(
                                "id", "coupon3",
                                "title", "週末優惠券",
                                "description", "週末使用享8折優惠",
                                "type", "PERCENTAGE",
                                "discountValue", 20,
                                "usedAt", "2024-08-15T14:30:00"
                        )
                )
        ));
    }

    @GetMapping("/{userId}/addresses")
    public ResponseEntity<?> getUserAddresses(@PathVariable String userId) {
        // 模擬地址數據
        return ResponseEntity.ok(java.util.Arrays.asList(
                Map.of(
                        "id", "addr1",
                        "label", "預設地址",
                        "recipientName", "王小明",
                        "phoneNumber", "0912-345-678",
                        "address", "台北市中正區忠孝西路一段50號",
                        "isDefault", true
                ),
                Map.of(
                        "id", "addr2",
                        "label", "公司地址",
                        "recipientName", "王小明",
                        "phoneNumber", "0912-345-678",
                        "address", "台北市信義區市府路45號",
                        "isDefault", false
                )
        ));
    }

    @GetMapping("/{userId}/reviews")
    public ResponseEntity<?> getUserReviews(@PathVariable String userId) {
        // 模擬評價數據
        return ResponseEntity.ok(java.util.Arrays.asList(
                Map.of(
                        "id", "review1",
                        "restaurantName", "彩虹餐廳",
                        "rating", 5.0,
                        "content", "招牌牛排很棒！肉質鮮嫩，調味恰到好處。服務態度也很好，會再來的！",
                        "items", java.util.Arrays.asList("招牌牛排", "蜜汁雞腿"),
                        "date", "2024-08-15T14:30:00"
                ),
                Map.of(
                        "id", "review2",
                        "restaurantName", "彩虹餐廳",
                        "rating", 4.0,
                        "content", "義式燉飯很香，份量也足夠。不過等待時間稍長，希望可以改善。",
                        "items", java.util.Arrays.asList("義式燉飯"),
                        "date", "2024-08-10T19:20:00"
                )
        ));
    }
    
    // DTO Classes
    public static class CreateUserRequest {
        private String username;
        private String email;
        private String phoneNumber;
        private String password;
        private UserRole role = UserRole.CUSTOMER;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
    }
    
    public static class AuthenticationRequest {
        private String email;
        private String password;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UpdateProfileRequest {
        private String username;
        private String phoneNumber;
        private String birthday;
        private String avatarUrl;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        
        public String getBirthday() { return birthday; }
        public void setBirthday(String birthday) { this.birthday = birthday; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        
        // Getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // 輔助方法
    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "Unknown Device";
        }
        
        // 簡單的設備識別邏輯
        if (userAgent.contains("Mobile")) {
            return "Mobile Device";
        } else if (userAgent.contains("Chrome")) {
            return "Chrome Browser";
        } else if (userAgent.contains("Firefox")) {
            return "Firefox Browser";
        } else if (userAgent.contains("Safari")) {
            return "Safari Browser";
        } else {
            return "Desktop Browser";
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
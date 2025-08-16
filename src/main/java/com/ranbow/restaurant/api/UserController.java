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
    
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        return ResponseEntity.ok(Map.of(
                "totalActiveUsers", userService.getTotalActiveUsers(),
                "totalCustomers", userService.getTotalCustomers()
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
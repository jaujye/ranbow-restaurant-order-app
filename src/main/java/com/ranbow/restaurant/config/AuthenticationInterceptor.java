package com.ranbow.restaurant.config;

import com.ranbow.restaurant.services.JwtService;
import com.ranbow.restaurant.services.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private SessionService sessionService;

    // 不需要認證的路徑
    private final List<String> publicPaths = Arrays.asList(
            "/api/users/login",
            "/api/users/register", 
            "/api/users",
            "/api/health",
            "/api/menu",
            "/api/menu/popular",
            "/api/menu/search",
            "/api/menu/category"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS請求直接通過
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String requestURI = request.getRequestURI();
        
        // 檢查是否為公開路徑
        for (String publicPath : publicPaths) {
            if (requestURI.startsWith(publicPath)) {
                return true;
            }
        }

        // 檢查Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Missing or invalid authorization header\"}");
            return false;
        }

        // 提取token
        String token = authHeader.substring(7);
        
        // 驗證JWT token
        JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
        if (tokenInfo == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
            return false;
        }

        // 驗證Redis會話
        SessionService.SessionData sessionData = sessionService.validateSession(tokenInfo.getSessionId());
        if (sessionData == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Session expired or invalid\"}");
            return false;
        }

        // 將用戶信息添加到request attributes
        request.setAttribute("userId", tokenInfo.getUserId());
        request.setAttribute("sessionId", tokenInfo.getSessionId());
        request.setAttribute("deviceInfo", tokenInfo.getDeviceInfo());

        // 檢查token是否即將過期，設置刷新提示
        if (jwtService.isTokenExpiringSoon(token)) {
            response.setHeader("X-Token-Refresh-Needed", "true");
        }

        return true;
    }
}
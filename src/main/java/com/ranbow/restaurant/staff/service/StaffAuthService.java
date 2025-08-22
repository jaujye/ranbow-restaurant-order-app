package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.staff.model.dto.*;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.WorkShift;
import com.ranbow.restaurant.staff.model.vo.StaffSession;
import com.ranbow.restaurant.staff.repository.StaffAuthRepository;
import com.ranbow.restaurant.staff.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Staff Authentication Service
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 * Handles login, refresh, PIN authentication, and session management
 */
@Service
@Transactional
public class StaffAuthService {
    
    @Autowired
    private StaffAuthRepository staffRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Staff login with device information
     * Returns comprehensive authentication response as per specification
     */
    public StaffAuthResponse login(StaffLoginRequest request, String ipAddress, String userAgent) {
        try {
            // Find staff by login ID (employee number or email)
            Optional<StaffMember> staffOpt = staffRepository.findStaffByLoginId(request.getLoginId());
            
            if (staffOpt.isEmpty()) {
                return StaffAuthResponse.error("Invalid login credentials");
            }
            
            StaffMember staff = staffOpt.get();
            
            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), staff.getPasswordHash())) {
                return StaffAuthResponse.error("Invalid login credentials");
            }
            
            // Check if staff is active
            if (!staff.isActive()) {
                return StaffAuthResponse.error("Account is inactive");
            }
            
            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(
                staff.getStaffId(),
                staff.getEmployeeNumber(),
                staff.getName(),
                staff.getRole(),
                staff.getPermissions(),
                request.getDeviceInfo().getDeviceId()
            );
            
            String refreshToken = jwtTokenProvider.generateRefreshToken(
                staff.getStaffId(),
                request.getDeviceInfo().getDeviceId()
            );
            
            // Create or update work shift
            WorkShift workShift = staffRepository.createWorkShift(staff.getStaffId());
            
            // Save session to database
            String sessionId = UUID.randomUUID().toString();
            LocalDateTime accessExpiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenExpirationInSeconds());
            LocalDateTime refreshExpiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpirationInSeconds());
            
            staffRepository.saveStaffSession(
                sessionId,
                staff.getStaffId(),
                jwtTokenProvider.generateTokenHash(accessToken),
                jwtTokenProvider.generateTokenHash(refreshToken),
                request.getDeviceInfo().getDeviceId(),
                request.getDeviceInfo().getDeviceType(),
                request.getDeviceInfo().getAppVersion(),
                ipAddress,
                userAgent,
                accessExpiresAt,
                refreshExpiresAt
            );
            
            // Update last login time
            staffRepository.updateLastLogin(staff.getStaffId());
            
            // Build response according to specification
            StaffAuthResponse.StaffInfo staffInfo = new StaffAuthResponse.StaffInfo();
            staffInfo.setStaffId(staff.getStaffId());
            staffInfo.setEmployeeNumber(staff.getEmployeeNumber());
            staffInfo.setName(staff.getName());
            staffInfo.setRole(staff.getRole());
            staffInfo.setDepartment(staff.getDepartment());
            staffInfo.setAvatar(staff.getAvatarUrl());
            staffInfo.setPermissions(staff.getPermissions());
            staffInfo.setQuickSwitchEnabled(staff.isQuickSwitchEnabled());
            
            StaffAuthResponse.AuthInfo authInfo = new StaffAuthResponse.AuthInfo();
            authInfo.setAccessToken(accessToken);
            authInfo.setRefreshToken(refreshToken);
            authInfo.setExpiresIn(jwtTokenProvider.getAccessTokenExpirationInSeconds());
            authInfo.setTokenType("Bearer");
            
            com.ranbow.restaurant.staff.model.vo.WorkShift workShiftVo = 
                com.ranbow.restaurant.staff.model.vo.WorkShift.fromEntity(workShift);
            
            StaffAuthResponse.StaffAuthData data = new StaffAuthResponse.StaffAuthData();
            data.setStaff(staffInfo);
            data.setAuth(authInfo);
            data.setWorkShift(workShiftVo);
            
            return StaffAuthResponse.success(data);
            
        } catch (Exception e) {
            e.printStackTrace();
            return StaffAuthResponse.error("Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Quick switch between staff using PIN
     */
    public StaffAuthResponse quickSwitch(StaffQuickSwitchRequest request, String ipAddress, String userAgent) {
        try {
            // Verify current staff exists
            Optional<StaffMember> currentStaffOpt = staffRepository.findStaffById(request.getCurrentStaffId());
            if (currentStaffOpt.isEmpty()) {
                return StaffAuthResponse.error("Current staff not found");
            }
            
            // Find target staff
            Optional<StaffMember> targetStaffOpt = staffRepository.findStaffById(request.getTargetStaffId());
            if (targetStaffOpt.isEmpty()) {
                return StaffAuthResponse.error("Target staff not found");
            }
            
            StaffMember targetStaff = targetStaffOpt.get();
            
            // Verify PIN
            if (!staffRepository.verifyStaffPin(request.getTargetStaffId(), request.getPin())) {
                return StaffAuthResponse.error("Invalid PIN");
            }
            
            // Check if target staff allows quick switch
            if (!targetStaff.isQuickSwitchEnabled()) {
                return StaffAuthResponse.error("Quick switch not enabled for target staff");
            }
            
            // Check if target staff is active
            if (!targetStaff.isActive()) {
                return StaffAuthResponse.error("Target staff account is inactive");
            }
            
            // Generate new tokens for target staff
            String deviceId = "QUICK-SWITCH-" + UUID.randomUUID().toString().substring(0, 8);
            
            String accessToken = jwtTokenProvider.generateAccessToken(
                targetStaff.getStaffId(),
                targetStaff.getEmployeeNumber(),
                targetStaff.getName(),
                targetStaff.getRole(),
                targetStaff.getPermissions(),
                deviceId
            );
            
            String refreshToken = jwtTokenProvider.generateRefreshToken(
                targetStaff.getStaffId(),
                deviceId
            );
            
            // Create or update work shift for target staff
            WorkShift workShift = staffRepository.createWorkShift(targetStaff.getStaffId());
            
            // Save new session
            String sessionId = UUID.randomUUID().toString();
            LocalDateTime accessExpiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenExpirationInSeconds());
            LocalDateTime refreshExpiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpirationInSeconds());
            
            staffRepository.saveStaffSession(
                sessionId,
                targetStaff.getStaffId(),
                jwtTokenProvider.generateTokenHash(accessToken),
                jwtTokenProvider.generateTokenHash(refreshToken),
                deviceId,
                "QUICK_SWITCH",
                "1.0.0",
                ipAddress,
                userAgent,
                accessExpiresAt,
                refreshExpiresAt
            );
            
            // Update last login time
            staffRepository.updateLastLogin(targetStaff.getStaffId());
            
            // Build quick switch response
            StaffAuthResponse.StaffInfo newStaff = new StaffAuthResponse.StaffInfo();
            newStaff.setStaffId(targetStaff.getStaffId());
            newStaff.setEmployeeNumber(targetStaff.getEmployeeNumber());
            newStaff.setName(targetStaff.getName());
            newStaff.setRole(targetStaff.getRole());
            newStaff.setDepartment(targetStaff.getDepartment());
            newStaff.setAvatar(targetStaff.getAvatarUrl());
            newStaff.setPermissions(targetStaff.getPermissions());
            newStaff.setQuickSwitchEnabled(targetStaff.isQuickSwitchEnabled());
            
            StaffAuthResponse.AuthInfo authInfo = new StaffAuthResponse.AuthInfo();
            authInfo.setAccessToken(accessToken);
            authInfo.setRefreshToken(refreshToken);
            authInfo.setExpiresIn(jwtTokenProvider.getAccessTokenExpirationInSeconds());
            authInfo.setTokenType("Bearer");
            
            com.ranbow.restaurant.staff.model.vo.WorkShift workShiftVo = 
                com.ranbow.restaurant.staff.model.vo.WorkShift.fromEntity(workShift);
            
            StaffAuthResponse.StaffAuthData data = new StaffAuthResponse.StaffAuthData();
            data.setStaff(newStaff);
            data.setAuth(authInfo);
            data.setWorkShift(workShiftVo);
            
            return StaffAuthResponse.success(data);
            
        } catch (Exception e) {
            e.printStackTrace();
            return StaffAuthResponse.error("Quick switch failed: " + e.getMessage());
        }
    }
    
    /**
     * Refresh access token using refresh token
     */
    public StaffAuthResponse refreshToken(StaffTokenRefreshRequest request) {
        try {
            // Validate refresh token
            if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
                return StaffAuthResponse.error("Invalid refresh token");
            }
            
            // Check token type
            String tokenType = jwtTokenProvider.getTokenTypeFromToken(request.getRefreshToken());
            if (!"refresh".equals(tokenType)) {
                return StaffAuthResponse.error("Token is not a refresh token");
            }
            
            // Find session by refresh token hash
            String refreshTokenHash = jwtTokenProvider.generateTokenHash(request.getRefreshToken());
            Optional<StaffSession> sessionOpt = staffRepository.findSessionByRefreshToken(refreshTokenHash);
            
            if (sessionOpt.isEmpty()) {
                return StaffAuthResponse.error("Session not found or expired");
            }
            
            StaffSession session = sessionOpt.get();
            
            // Verify device ID if provided
            if (request.getDeviceId() != null && !request.getDeviceId().equals(session.getDeviceId())) {
                return StaffAuthResponse.error("Device ID mismatch");
            }
            
            // Get staff information
            Optional<StaffMember> staffOpt = staffRepository.findStaffById(session.getStaffId());
            if (staffOpt.isEmpty()) {
                return StaffAuthResponse.error("Staff not found");
            }
            
            StaffMember staff = staffOpt.get();
            
            // Generate new access token
            String newAccessToken = jwtTokenProvider.generateAccessToken(
                staff.getStaffId(),
                staff.getEmployeeNumber(),
                staff.getName(),
                staff.getRole(),
                staff.getPermissions(),
                session.getDeviceId()
            );
            
            // Update session activity
            staffRepository.updateSessionActivity(session.getSessionId());
            
            // Build response with new access token
            StaffAuthResponse.StaffInfo staffInfo = new StaffAuthResponse.StaffInfo();
            staffInfo.setStaffId(staff.getStaffId());
            staffInfo.setEmployeeNumber(staff.getEmployeeNumber());
            staffInfo.setName(staff.getName());
            staffInfo.setRole(staff.getRole());
            staffInfo.setDepartment(staff.getDepartment());
            staffInfo.setAvatar(staff.getAvatarUrl());
            staffInfo.setPermissions(staff.getPermissions());
            staffInfo.setQuickSwitchEnabled(staff.isQuickSwitchEnabled());
            
            StaffAuthResponse.AuthInfo authInfo = new StaffAuthResponse.AuthInfo();
            authInfo.setAccessToken(newAccessToken);
            authInfo.setRefreshToken(request.getRefreshToken()); // Keep the same refresh token
            authInfo.setExpiresIn(jwtTokenProvider.getAccessTokenExpirationInSeconds());
            authInfo.setTokenType("Bearer");
            
            // Get current work shift
            Optional<WorkShift> workShiftOpt = staffRepository.getCurrentWorkShift(staff.getStaffId());
            com.ranbow.restaurant.staff.model.vo.WorkShift workShiftVo = null;
            if (workShiftOpt.isPresent()) {
                workShiftVo = com.ranbow.restaurant.staff.model.vo.WorkShift.fromEntity(workShiftOpt.get());
            }
            
            StaffAuthResponse.StaffAuthData data = new StaffAuthResponse.StaffAuthData();
            data.setStaff(staffInfo);
            data.setAuth(authInfo);
            data.setWorkShift(workShiftVo);
            
            return StaffAuthResponse.success(data);
            
        } catch (Exception e) {
            e.printStackTrace();
            return StaffAuthResponse.error("Token refresh failed: " + e.getMessage());
        }
    }
    
    /**
     * Get staff profile by ID
     */
    public StaffAuthResponse getStaffProfile(String staffId) {
        try {
            Optional<StaffMember> staffOpt = staffRepository.findStaffById(staffId);
            if (staffOpt.isEmpty()) {
                return StaffAuthResponse.error("Staff not found");
            }
            
            StaffMember staff = staffOpt.get();
            
            StaffAuthResponse.StaffInfo staffInfo = new StaffAuthResponse.StaffInfo();
            staffInfo.setStaffId(staff.getStaffId());
            staffInfo.setEmployeeNumber(staff.getEmployeeNumber());
            staffInfo.setName(staff.getName());
            staffInfo.setRole(staff.getRole());
            staffInfo.setDepartment(staff.getDepartment());
            staffInfo.setAvatar(staff.getAvatarUrl());
            staffInfo.setPermissions(staff.getPermissions());
            staffInfo.setQuickSwitchEnabled(staff.isQuickSwitchEnabled());
            
            // Get current work shift
            Optional<WorkShift> workShiftOpt = staffRepository.getCurrentWorkShift(staff.getStaffId());
            com.ranbow.restaurant.staff.model.vo.WorkShift workShiftVo = null;
            if (workShiftOpt.isPresent()) {
                workShiftVo = com.ranbow.restaurant.staff.model.vo.WorkShift.fromEntity(workShiftOpt.get());
            }
            
            StaffAuthResponse.StaffAuthData data = new StaffAuthResponse.StaffAuthData();
            data.setStaff(staffInfo);
            data.setAuth(null); // No auth info for profile endpoint
            data.setWorkShift(workShiftVo);
            
            return StaffAuthResponse.success(data);
            
        } catch (Exception e) {
            e.printStackTrace();
            return StaffAuthResponse.error("Failed to get staff profile: " + e.getMessage());
        }
    }
    
    /**
     * Logout staff and deactivate session
     */
    public boolean logout(String accessToken) {
        try {
            if (!jwtTokenProvider.validateToken(accessToken)) {
                return false;
            }
            
            String accessTokenHash = jwtTokenProvider.generateTokenHash(accessToken);
            // Note: We'd need to add a method to find session by access token hash
            // For now, we'll deactivate all sessions for the staff
            String staffId = jwtTokenProvider.getStaffIdFromToken(accessToken);
            staffRepository.deactivateAllStaffSessions(staffId);
            
            return true;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Get available staff for quick switch
     */
    public List<StaffMember> getQuickSwitchStaff() {
        return staffRepository.getQuickSwitchAvailableStaff();
    }
    
    /**
     * Cleanup expired sessions (scheduled task)
     */
    public int cleanupExpiredSessions() {
        return staffRepository.cleanupExpiredSessions();
    }
}
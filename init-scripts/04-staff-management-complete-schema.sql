-- ================================
-- COMPLETE STAFF MANAGEMENT DATABASE SCHEMA
-- ================================
-- Version: 1.0
-- Date: 2025-08-22
-- Description: Complete staff management system schema for Ranbow Restaurant
-- Based on: STAFF_UI_DEVELOPMENT_DOC.md specifications
-- Features: Staff authentication, work shifts, order assignments, cooking timers, and comprehensive audit logging

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- 1. ENHANCED STAFF_MEMBERS TABLE
-- ================================

-- Drop and recreate staff_members with complete specification
DROP TABLE IF EXISTS staff_members CASCADE;

CREATE TABLE staff_members (
    staff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255), -- For quick switch authentication
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'KITCHEN', 'SERVICE', 'CASHIER')),
    department VARCHAR(50),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    quick_switch_enabled BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comprehensive indexes for staff_members
CREATE INDEX idx_staff_employee_number ON staff_members(employee_number);
CREATE INDEX idx_staff_email ON staff_members(email);
CREATE INDEX idx_staff_role_active ON staff_members(role, is_active);
CREATE INDEX idx_staff_department ON staff_members(department);
CREATE INDEX idx_staff_quick_switch ON staff_members(quick_switch_enabled) WHERE quick_switch_enabled = true;
CREATE INDEX idx_staff_account_locked ON staff_members(account_locked_until) WHERE account_locked_until IS NOT NULL;
CREATE INDEX idx_staff_last_login ON staff_members(last_login_at);

-- ================================
-- 2. ENHANCED WORK_SHIFTS TABLE
-- ================================

-- Drop and recreate work_shifts with complete specification
DROP TABLE IF EXISTS work_shifts CASCADE;

CREATE TABLE work_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    break_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique shift per staff per date
    UNIQUE(staff_id, shift_date)
);

-- Add performance indexes for work_shifts
CREATE INDEX idx_shifts_staff_date ON work_shifts(staff_id, shift_date);
CREATE INDEX idx_shifts_date_status ON work_shifts(shift_date, status);
CREATE INDEX idx_shifts_active ON work_shifts(actual_start, actual_end) WHERE status = 'ACTIVE';
CREATE INDEX idx_shifts_scheduled_start ON work_shifts(scheduled_start);
CREATE INDEX idx_shifts_overtime ON work_shifts(overtime_minutes) WHERE overtime_minutes > 0;

-- ================================
-- 3. ORDER_ASSIGNMENTS TABLE
-- ================================

CREATE TABLE order_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) NOT NULL, -- Reference to orders.order_id
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY')),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes (auto-calculated on completion)
    notes TEXT,
    workstation_id VARCHAR(50), -- Kitchen station or service area
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add performance indexes for order_assignments
CREATE INDEX idx_assignments_order_staff ON order_assignments(order_id, staff_id);
CREATE INDEX idx_assignments_status_priority ON order_assignments(status, priority);
CREATE INDEX idx_assignments_staff_active ON order_assignments(staff_id, status) WHERE status IN ('ASSIGNED', 'IN_PROGRESS');
CREATE INDEX idx_assignments_assigned_at ON order_assignments(assigned_at);
CREATE INDEX idx_assignments_priority_status ON order_assignments(priority DESC, status);
CREATE INDEX idx_assignments_workstation ON order_assignments(workstation_id);

-- ================================
-- 4. COOKING_TIMERS TABLE
-- ================================

CREATE TABLE cooking_timers (
    timer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) NOT NULL, -- Reference to orders.order_id
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES order_assignments(assignment_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    pause_time TIMESTAMP,
    resume_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_duration INTEGER NOT NULL, -- in seconds
    actual_duration INTEGER, -- in seconds (auto-calculated)
    paused_duration INTEGER DEFAULT 0, -- total paused time in seconds
    status VARCHAR(20) DEFAULT 'RUNNING' CHECK (status IN ('IDLE', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    cooking_stage VARCHAR(20) DEFAULT 'PREP' CHECK (cooking_stage IN ('PREP', 'COOKING', 'PLATING', 'READY')),
    alerts_sent INTEGER DEFAULT 0,
    alert_config JSONB DEFAULT '{"halfTime": true, "nearComplete": true, "overdue": true, "intervals": [300, 60, 0]}'::JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add performance indexes for cooking_timers
CREATE INDEX idx_timers_order ON cooking_timers(order_id);
CREATE INDEX idx_timers_staff_active ON cooking_timers(staff_id, status) WHERE status = 'RUNNING';
CREATE INDEX idx_timers_status_stage ON cooking_timers(status, cooking_stage);
CREATE INDEX idx_timers_start_time ON cooking_timers(start_time);
CREATE INDEX idx_timers_assignment ON cooking_timers(assignment_id);
CREATE INDEX idx_timers_alerts_sent ON cooking_timers(alerts_sent);

-- ================================
-- 5. COMPREHENSIVE STAFF_ACTIVITIES TABLE
-- ================================

CREATE TABLE staff_activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'LOGIN', 'LOGOUT', 'QUICK_SWITCH', 'PASSWORD_CHANGE', 
        'ORDER_VIEW', 'ORDER_ASSIGN', 'ORDER_START', 'ORDER_UPDATE', 'ORDER_COMPLETE', 'ORDER_CANCEL',
        'TIMER_START', 'TIMER_PAUSE', 'TIMER_RESUME', 'TIMER_COMPLETE',
        'BREAK_START', 'BREAK_END', 'SHIFT_START', 'SHIFT_END',
        'SYSTEM_ACCESS', 'SETTINGS_CHANGE', 'NOTIFICATION_VIEW', 'ERROR_EVENT'
    )),
    order_id VARCHAR(255), -- Reference to orders table
    target_staff_id UUID REFERENCES staff_members(staff_id), -- For activities involving other staff
    description TEXT,
    metadata JSONB, -- Additional structured data
    duration_seconds INTEGER, -- For timed activities
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(100),
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comprehensive indexes for staff_activities
CREATE INDEX idx_activities_staff_type ON staff_activities(staff_id, activity_type);
CREATE INDEX idx_activities_created_at ON staff_activities(created_at);
CREATE INDEX idx_activities_order ON staff_activities(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_activities_type_created ON staff_activities(activity_type, created_at);
CREATE INDEX idx_activities_session ON staff_activities(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_activities_device ON staff_activities(device_id) WHERE device_id IS NOT NULL;
CREATE INDEX idx_activities_target_staff ON staff_activities(target_staff_id) WHERE target_staff_id IS NOT NULL;

-- ================================
-- 6. STAFF_SESSIONS TABLE (JWT Management)
-- ================================

CREATE TABLE staff_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(100),
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for staff_sessions
CREATE INDEX idx_staff_sessions_staff_id ON staff_sessions(staff_id);
CREATE INDEX idx_staff_sessions_access_token ON staff_sessions(access_token_hash);
CREATE INDEX idx_staff_sessions_refresh_token ON staff_sessions(refresh_token_hash);
CREATE INDEX idx_staff_sessions_device ON staff_sessions(device_id);
CREATE INDEX idx_staff_sessions_expires_at ON staff_sessions(expires_at);
CREATE INDEX idx_staff_sessions_active ON staff_sessions(is_active, expires_at) WHERE is_active = true;

-- ================================
-- 7. STAFF_PERFORMANCE TABLE (Performance Metrics)
-- ================================

CREATE TABLE staff_performance (
    performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period VARCHAR(20) DEFAULT 'DAILY' CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    
    -- Order Processing Metrics
    orders_assigned INTEGER DEFAULT 0,
    orders_completed INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    average_completion_time_minutes DECIMAL(8,2) DEFAULT 0.00,
    overtime_orders INTEGER DEFAULT 0,
    
    -- Time Metrics
    scheduled_minutes INTEGER DEFAULT 0,
    worked_minutes INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    
    -- Efficiency Metrics
    efficiency_score DECIMAL(5,2) DEFAULT 0.00 CHECK (efficiency_score >= 0.00 AND efficiency_score <= 100.00),
    quality_score DECIMAL(5,2) DEFAULT 0.00 CHECK (quality_score >= 0.00 AND quality_score <= 100.00),
    punctuality_score DECIMAL(5,2) DEFAULT 0.00 CHECK (punctuality_score >= 0.00 AND punctuality_score <= 100.00),
    
    -- Customer Interaction (for service staff)
    customer_interactions INTEGER DEFAULT 0,
    customer_compliments INTEGER DEFAULT 0,
    customer_complaints INTEGER DEFAULT 0,
    
    -- Revenue Impact
    total_revenue_handled DECIMAL(12,2) DEFAULT 0.00,
    average_order_value DECIMAL(8,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per staff per date per period
    UNIQUE(staff_id, date, period)
);

-- Add indexes for staff_performance
CREATE INDEX idx_staff_performance_staff_date ON staff_performance(staff_id, date);
CREATE INDEX idx_staff_performance_period ON staff_performance(period, date);
CREATE INDEX idx_staff_performance_efficiency ON staff_performance(efficiency_score DESC);
CREATE INDEX idx_staff_performance_revenue ON staff_performance(total_revenue_handled DESC);

-- ================================
-- 8. DATABASE FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to staff_members table
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to staff_performance table
CREATE TRIGGER update_staff_performance_updated_at 
    BEFORE UPDATE ON staff_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate shift duration
CREATE OR REPLACE FUNCTION calculate_shift_duration(
    p_start TIMESTAMP, 
    p_end TIMESTAMP, 
    p_break_minutes INTEGER
) RETURNS INTEGER AS $$
BEGIN
    IF p_start IS NULL OR p_end IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN EXTRACT(EPOCH FROM (p_end - p_start))/60 - COALESCE(p_break_minutes, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate timer duration
CREATE OR REPLACE FUNCTION calculate_timer_duration(
    p_start TIMESTAMP,
    p_end TIMESTAMP,
    p_paused_duration INTEGER
) RETURNS INTEGER AS $$
BEGIN
    IF p_start IS NULL OR p_end IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN EXTRACT(EPOCH FROM (p_end - p_start)) - COALESCE(p_paused_duration, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update assignment duration on completion
CREATE OR REPLACE FUNCTION update_assignment_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' AND NEW.completed_at IS NOT NULL THEN
        NEW.actual_duration = EXTRACT(EPOCH FROM (NEW.completed_at - COALESCE(NEW.started_at, NEW.assigned_at)))/60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to order_assignments
CREATE TRIGGER update_assignment_duration_trigger
    BEFORE UPDATE ON order_assignments
    FOR EACH ROW EXECUTE FUNCTION update_assignment_duration();

-- Function to auto-update timer duration
CREATE OR REPLACE FUNCTION update_timer_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' AND NEW.end_time IS NOT NULL THEN
        NEW.actual_duration = calculate_timer_duration(NEW.start_time, NEW.end_time, NEW.paused_duration);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to cooking_timers
CREATE TRIGGER update_timer_duration_trigger
    BEFORE UPDATE ON cooking_timers
    FOR EACH ROW EXECUTE FUNCTION update_timer_duration();

-- Function to record staff activity
CREATE OR REPLACE FUNCTION record_staff_activity(
    p_staff_id UUID,
    p_activity_type VARCHAR(50),
    p_order_id VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL,
    p_device_id VARCHAR(100) DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO staff_activities (
        staff_id, activity_type, order_id, description, metadata, 
        duration_seconds, device_id, session_id
    )
    VALUES (
        p_staff_id, p_activity_type, p_order_id, p_description, p_metadata,
        p_duration_seconds, p_device_id, p_session_id
    )
    RETURNING staff_activities.activity_id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    UPDATE staff_sessions 
    SET is_active = false 
    WHERE (expires_at < CURRENT_TIMESTAMP OR refresh_expires_at < CURRENT_TIMESTAMP) 
    AND is_active = true;
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Function to start work shift
CREATE OR REPLACE FUNCTION start_work_shift(
    p_staff_id UUID,
    p_device_id VARCHAR(100) DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    shift_id UUID;
BEGIN
    -- End any active shift first
    UPDATE work_shifts 
    SET status = 'COMPLETED', 
        actual_end = CURRENT_TIMESTAMP,
        overtime_minutes = CASE 
            WHEN CURRENT_TIMESTAMP > scheduled_end 
            THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - scheduled_end))/60
            ELSE 0
        END
    WHERE staff_id = p_staff_id AND status = 'ACTIVE';
    
    -- Start new shift or activate scheduled shift
    INSERT INTO work_shifts (
        staff_id, shift_date, scheduled_start, scheduled_end, 
        actual_start, status
    )
    VALUES (
        p_staff_id, CURRENT_DATE, CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP + INTERVAL '8 hours', CURRENT_TIMESTAMP, 'ACTIVE'
    )
    ON CONFLICT (staff_id, shift_date) 
    DO UPDATE SET 
        actual_start = CURRENT_TIMESTAMP, 
        status = 'ACTIVE'
    RETURNING work_shifts.shift_id INTO shift_id;
    
    -- Record activity
    PERFORM record_staff_activity(
        p_staff_id, 'SHIFT_START', NULL, 'Work shift started',
        NULL, NULL, p_device_id, p_session_id
    );
    
    RETURN shift_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end work shift
CREATE OR REPLACE FUNCTION end_work_shift(
    p_staff_id UUID,
    p_device_id VARCHAR(100) DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    shift_count INTEGER;
BEGIN
    UPDATE work_shifts 
    SET actual_end = CURRENT_TIMESTAMP, 
        status = 'COMPLETED',
        overtime_minutes = CASE 
            WHEN CURRENT_TIMESTAMP > scheduled_end 
            THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - scheduled_end))/60
            ELSE 0
        END
    WHERE staff_id = p_staff_id AND status = 'ACTIVE';
    
    GET DIAGNOSTICS shift_count = ROW_COUNT;
    
    IF shift_count > 0 THEN
        -- Record activity
        PERFORM record_staff_activity(
            p_staff_id, 'SHIFT_END', NULL, 'Work shift ended',
            NULL, NULL, p_device_id, p_session_id
        );
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 9. INITIAL SAMPLE DATA
-- ================================

-- Insert sample staff members with various roles and permissions
INSERT INTO staff_members (
    employee_number, email, password_hash, pin_hash, name, role, department, 
    permissions, is_active, quick_switch_enabled
) VALUES
(
    'ADMIN001', 'admin@ranbow.restaurant', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS',
    '系統管理員', 'ADMIN', '管理部',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'ORDER_ASSIGN', 'STAFF_MANAGE', 'SYSTEM_SETTINGS', 'KITCHEN_MANAGE'],
    true, true
),
(
    'KITCHEN001', 'chef1@ranbow.restaurant',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS',
    '李主廚', 'KITCHEN', '廚房',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'TIMER_MANAGE', 'KITCHEN_MANAGE'],
    true, true
),
(
    'SERVICE001', 'server1@ranbow.restaurant',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS',
    '王服務員', 'SERVICE', '服務部',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'CUSTOMER_MANAGE'],
    true, true
),
(
    'CASHIER001', 'cashier1@ranbow.restaurant',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NULL,
    '張收銀員', 'CASHIER', '收銀部',
    ARRAY['ORDER_VIEW', 'PAYMENT_PROCESS'],
    true, false
);

-- Insert sample work shifts for today
INSERT INTO work_shifts (staff_id, shift_date, scheduled_start, scheduled_end, status) 
SELECT 
    staff_id,
    CURRENT_DATE,
    CURRENT_DATE + CASE 
        WHEN role = 'ADMIN' THEN TIME '08:00:00'
        WHEN role = 'KITCHEN' THEN TIME '09:00:00'
        WHEN role = 'SERVICE' THEN TIME '10:00:00'
        ELSE TIME '11:00:00'
    END,
    CURRENT_DATE + CASE 
        WHEN role = 'ADMIN' THEN TIME '17:00:00'
        WHEN role = 'KITCHEN' THEN TIME '18:00:00' 
        WHEN role = 'SERVICE' THEN TIME '19:00:00'
        ELSE TIME '20:00:00'
    END,
    'SCHEDULED'
FROM staff_members
WHERE is_active = true;

-- ================================
-- 10. PERFORMANCE VIEWS
-- ================================

-- Comprehensive staff dashboard view
CREATE OR REPLACE VIEW staff_dashboard_summary AS
SELECT 
    sm.staff_id,
    sm.employee_number,
    sm.name,
    sm.role,
    sm.department,
    sm.is_active,
    sm.quick_switch_enabled,
    sm.last_login_at,
    
    -- Current shift status
    ws.shift_id,
    ws.status as shift_status,
    ws.scheduled_start,
    ws.scheduled_end,
    ws.actual_start,
    ws.actual_end,
    
    -- Active assignments
    COUNT(oa.assignment_id) as active_assignments,
    
    -- Active timers
    COUNT(ct.timer_id) as active_timers,
    
    -- Today's performance
    COALESCE(sp.orders_completed, 0) as today_orders_completed,
    COALESCE(sp.efficiency_score, 0) as today_efficiency_score,
    COALESCE(sp.total_revenue_handled, 0) as today_revenue_handled,
    
    -- Recent activity count
    COUNT(sa.activity_id) as recent_activities
    
FROM staff_members sm
LEFT JOIN work_shifts ws ON sm.staff_id = ws.staff_id 
    AND ws.shift_date = CURRENT_DATE
LEFT JOIN order_assignments oa ON sm.staff_id = oa.staff_id 
    AND oa.status IN ('ASSIGNED', 'IN_PROGRESS')
LEFT JOIN cooking_timers ct ON sm.staff_id = ct.staff_id 
    AND ct.status = 'RUNNING'
LEFT JOIN staff_performance sp ON sm.staff_id = sp.staff_id 
    AND sp.date = CURRENT_DATE AND sp.period = 'DAILY'
LEFT JOIN staff_activities sa ON sm.staff_id = sa.staff_id 
    AND sa.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
WHERE sm.is_active = true
GROUP BY sm.staff_id, sm.employee_number, sm.name, sm.role, sm.department,
         sm.is_active, sm.quick_switch_enabled, sm.last_login_at,
         ws.shift_id, ws.status, ws.scheduled_start, ws.scheduled_end, 
         ws.actual_start, ws.actual_end, sp.orders_completed, 
         sp.efficiency_score, sp.total_revenue_handled;

-- Kitchen workload view
CREATE OR REPLACE VIEW kitchen_workload_summary AS
SELECT 
    sm.staff_id,
    sm.employee_number,
    sm.name,
    
    -- Active assignments
    COUNT(oa.assignment_id) as active_orders,
    
    -- Active timers
    COUNT(ct.timer_id) as active_timers,
    
    -- Priority breakdown
    COUNT(CASE WHEN oa.priority = 'EMERGENCY' THEN 1 END) as emergency_orders,
    COUNT(CASE WHEN oa.priority = 'URGENT' THEN 1 END) as urgent_orders,
    COUNT(CASE WHEN oa.priority = 'HIGH' THEN 1 END) as high_orders,
    COUNT(CASE WHEN oa.priority = 'NORMAL' THEN 1 END) as normal_orders,
    
    -- Overdue orders
    COUNT(CASE WHEN oa.estimated_duration IS NOT NULL 
               AND oa.assigned_at + (oa.estimated_duration || ' minutes')::INTERVAL < CURRENT_TIMESTAMP 
               AND oa.status != 'COMPLETED' 
               THEN 1 END) as overdue_orders,
               
    -- Workstation assignment
    oa.workstation_id,
    
    -- Efficiency metrics
    AVG(CASE WHEN oa.actual_duration IS NOT NULL AND oa.estimated_duration IS NOT NULL 
             THEN (oa.estimated_duration::FLOAT / oa.actual_duration) * 100 
             ELSE NULL END) as efficiency_percentage
             
FROM staff_members sm
LEFT JOIN order_assignments oa ON sm.staff_id = oa.staff_id 
    AND oa.status IN ('ASSIGNED', 'IN_PROGRESS')
LEFT JOIN cooking_timers ct ON oa.assignment_id = ct.assignment_id 
    AND ct.status = 'RUNNING'
WHERE sm.role = 'KITCHEN' AND sm.is_active = true
GROUP BY sm.staff_id, sm.employee_number, sm.name, oa.workstation_id;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'COMPLETE STAFF MANAGEMENT SYSTEM DEPLOYED!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Database Schema Version: 1.0';
    RAISE NOTICE 'Deployed Tables:';
    RAISE NOTICE '✅ staff_members - Enhanced with security features';
    RAISE NOTICE '✅ work_shifts - Complete shift management';
    RAISE NOTICE '✅ order_assignments - Order-staff mapping system';
    RAISE NOTICE '✅ cooking_timers - Kitchen timer management';
    RAISE NOTICE '✅ staff_activities - Comprehensive audit logging';
    RAISE NOTICE '✅ staff_sessions - JWT session management';
    RAISE NOTICE '✅ staff_performance - Performance metrics tracking';
    RAISE NOTICE '';
    RAISE NOTICE 'Deployed Functions:';
    RAISE NOTICE '✅ record_staff_activity() - Activity logging';
    RAISE NOTICE '✅ start_work_shift() - Shift management';
    RAISE NOTICE '✅ end_work_shift() - Shift management';
    RAISE NOTICE '✅ cleanup_expired_sessions() - Session cleanup';
    RAISE NOTICE '✅ calculate_shift_duration() - Time calculations';
    RAISE NOTICE '✅ calculate_timer_duration() - Timer calculations';
    RAISE NOTICE '';
    RAISE NOTICE 'Deployed Views:';
    RAISE NOTICE '✅ staff_dashboard_summary - Management dashboard';
    RAISE NOTICE '✅ kitchen_workload_summary - Kitchen operations';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample Data Created:';
    RAISE NOTICE '👤 4 Staff Members (Admin, Kitchen, Service, Cashier)';
    RAISE NOTICE '📅 Today''s work shifts scheduled';
    RAISE NOTICE '';
    RAISE NOTICE 'Default Password: "password123" (BCrypt hashed)';
    RAISE NOTICE 'System ready for staff operations!';
    RAISE NOTICE '=====================================';
END $$;
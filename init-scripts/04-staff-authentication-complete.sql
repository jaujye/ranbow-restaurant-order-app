-- =====================================
-- Staff Authentication System - Complete Database Schema
-- Version: 2.0
-- Created: 2025-08-22
-- Description: Comprehensive database schema for staff authentication
-- =====================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- 1. STAFF MEMBERS TABLE (Enhanced)
-- =====================================
CREATE TABLE IF NOT EXISTS staff_members (
    staff_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'SERVICE',
    department VARCHAR(100),
    avatar_url TEXT,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    quick_switch_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for staff_members
CREATE INDEX IF NOT EXISTS idx_staff_members_employee_number ON staff_members(employee_number);
CREATE INDEX IF NOT EXISTS idx_staff_members_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_quick_switch ON staff_members(quick_switch_enabled) WHERE quick_switch_enabled = true;
CREATE INDEX IF NOT EXISTS idx_staff_members_last_login ON staff_members(last_login_at);

-- =====================================
-- 2. WORK SHIFTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS work_shifts (
    shift_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    break_start_time TIMESTAMP,
    break_end_time TIMESTAMP,
    total_hours DECIMAL(4,2),
    shift_status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for work_shifts
CREATE INDEX IF NOT EXISTS idx_work_shifts_staff_id ON work_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_start_time ON work_shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_work_shifts_status ON work_shifts(shift_status);
CREATE INDEX IF NOT EXISTS idx_work_shifts_date ON work_shifts(DATE(start_time));

-- =====================================
-- 3. STAFF SESSIONS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS staff_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for staff_sessions
CREATE INDEX IF NOT EXISTS idx_staff_sessions_staff_id ON staff_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_access_token ON staff_sessions(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_refresh_token ON staff_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_device_id ON staff_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_active ON staff_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_sessions_expires ON staff_sessions(access_expires_at);

-- =====================================
-- 4. ORDER ASSIGNMENTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS order_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- 'PREPARATION', 'SERVING', 'DELIVERY'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    assignment_status VARCHAR(20) DEFAULT 'ASSIGNED',
    priority VARCHAR(10) DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    estimated_completion_time TIMESTAMP,
    actual_completion_time TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES staff_members(staff_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for order_assignments
CREATE INDEX IF NOT EXISTS idx_order_assignments_order_id ON order_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_staff_id ON order_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_status ON order_assignments(assignment_status);
CREATE INDEX IF NOT EXISTS idx_order_assignments_type ON order_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_order_assignments_priority ON order_assignments(priority);
CREATE INDEX IF NOT EXISTS idx_order_assignments_date ON order_assignments(DATE(assigned_at));

-- =====================================
-- 5. COOKING TIMERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS cooking_timers (
    timer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    menu_item_id UUID,
    cooking_stage VARCHAR(50) NOT NULL, -- 'PREP', 'COOKING', 'PLATING', 'READY'
    timer_duration INTEGER NOT NULL, -- in seconds
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP,
    resumed_at TIMESTAMP,
    completed_at TIMESTAMP,
    timer_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
    remaining_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for cooking_timers
CREATE INDEX IF NOT EXISTS idx_cooking_timers_order_id ON cooking_timers(order_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_staff_id ON cooking_timers(staff_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_status ON cooking_timers(timer_status);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_stage ON cooking_timers(cooking_stage);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_active ON cooking_timers(timer_status) WHERE timer_status = 'ACTIVE';

-- =====================================
-- 6. STAFF ACTIVITIES AUDIT TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS staff_activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'QUICK_SWITCH', 'ORDER_ACTION', etc.
    activity_action VARCHAR(100) NOT NULL,
    target_id UUID, -- Can reference order_id, other staff_id, etc.
    target_type VARCHAR(50), -- 'ORDER', 'STAFF', 'SYSTEM'
    device_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    activity_data JSONB, -- Additional data in JSON format
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for staff_activities
CREATE INDEX IF NOT EXISTS idx_staff_activities_staff_id ON staff_activities(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_activities_type ON staff_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_staff_activities_date ON staff_activities(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_staff_activities_success ON staff_activities(success);
CREATE INDEX IF NOT EXISTS idx_staff_activities_session ON staff_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_staff_activities_target ON staff_activities(target_id, target_type);

-- =====================================
-- 7. STAFF PERMISSIONS TABLE (Reference)
-- =====================================
CREATE TABLE IF NOT EXISTS staff_permission_definitions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'ORDER_MANAGEMENT', 'KITCHEN_OPERATIONS', 'ADMIN', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO staff_permission_definitions (permission_code, permission_name, description, category) VALUES
('ORDER_VIEW', 'View Orders', 'Can view order details and status', 'ORDER_MANAGEMENT'),
('ORDER_UPDATE', 'Update Orders', 'Can update order status and details', 'ORDER_MANAGEMENT'),
('ORDER_CANCEL', 'Cancel Orders', 'Can cancel orders', 'ORDER_MANAGEMENT'),
('KITCHEN_VIEW', 'View Kitchen Queue', 'Can view kitchen order queue', 'KITCHEN_OPERATIONS'),
('KITCHEN_UPDATE', 'Update Kitchen Status', 'Can update cooking progress', 'KITCHEN_OPERATIONS'),
('TIMER_MANAGE', 'Manage Cooking Timers', 'Can start/stop cooking timers', 'KITCHEN_OPERATIONS'),
('STAFF_SWITCH', 'Quick Switch Staff', 'Can switch between staff accounts', 'STAFF_OPERATIONS'),
('REPORTS_VIEW', 'View Reports', 'Can view performance reports', 'REPORTING'),
('ADMIN_USERS', 'Manage Staff', 'Can manage staff accounts', 'ADMINISTRATION'),
('ADMIN_SYSTEM', 'System Administration', 'Full system administration access', 'ADMINISTRATION')
ON CONFLICT (permission_code) DO NOTHING;

-- =====================================
-- 8. DEVICE REGISTRATIONS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS device_registrations (
    device_id VARCHAR(255) PRIMARY KEY,
    device_name VARCHAR(255),
    device_type VARCHAR(50) NOT NULL,
    registered_by UUID REFERENCES staff_members(staff_id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    device_info JSONB,
    location VARCHAR(100),
    notes TEXT
);

-- Indexes for device_registrations
CREATE INDEX IF NOT EXISTS idx_device_registrations_type ON device_registrations(device_type);
CREATE INDEX IF NOT EXISTS idx_device_registrations_active ON device_registrations(is_active);
CREATE INDEX IF NOT EXISTS idx_device_registrations_location ON device_registrations(location);

-- =====================================
-- 9. VIEWS FOR REPORTING
-- =====================================

-- Active staff sessions view
CREATE OR REPLACE VIEW active_staff_sessions AS
SELECT 
    s.session_id,
    s.staff_id,
    sm.employee_number,
    sm.full_name,
    sm.role,
    s.device_id,
    s.device_type,
    s.created_at as login_time,
    s.last_accessed_at,
    s.access_expires_at
FROM staff_sessions s
JOIN staff_members sm ON s.staff_id = sm.staff_id
WHERE s.is_active = true 
  AND s.access_expires_at > CURRENT_TIMESTAMP;

-- Current work shifts view
CREATE OR REPLACE VIEW current_work_shifts AS
SELECT 
    ws.shift_id,
    ws.staff_id,
    sm.employee_number,
    sm.full_name,
    sm.role,
    ws.start_time,
    ws.shift_status,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ws.start_time))/3600 as hours_worked
FROM work_shifts ws
JOIN staff_members sm ON ws.staff_id = sm.staff_id
WHERE ws.shift_status = 'ACTIVE';

-- Staff performance summary view
CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT 
    sm.staff_id,
    sm.employee_number,
    sm.full_name,
    sm.role,
    COUNT(DISTINCT DATE(ws.start_time)) as days_worked,
    AVG(ws.total_hours) as avg_hours_per_shift,
    COUNT(oa.assignment_id) as total_assignments,
    COUNT(CASE WHEN oa.assignment_status = 'COMPLETED' THEN 1 END) as completed_assignments,
    COALESCE(
        COUNT(CASE WHEN oa.assignment_status = 'COMPLETED' THEN 1 END)::FLOAT / 
        NULLIF(COUNT(oa.assignment_id), 0) * 100, 
        0
    ) as completion_rate
FROM staff_members sm
LEFT JOIN work_shifts ws ON sm.staff_id = ws.staff_id 
    AND ws.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN order_assignments oa ON sm.staff_id = oa.staff_id 
    AND oa.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE sm.is_active = true
GROUP BY sm.staff_id, sm.employee_number, sm.full_name, sm.role;

-- =====================================
-- 10. FUNCTIONS AND TRIGGERS
-- =====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_shifts_updated_at BEFORE UPDATE ON work_shifts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_assignments_updated_at BEFORE UPDATE ON order_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cooking_timers_updated_at BEFORE UPDATE ON cooking_timers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically end work shifts
CREATE OR REPLACE FUNCTION auto_end_expired_shifts()
RETURNS void AS $$
BEGIN
    UPDATE work_shifts 
    SET 
        end_time = start_time + INTERVAL '12 hours',
        shift_status = 'COMPLETED',
        total_hours = 12,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        shift_status = 'ACTIVE' 
        AND start_time < CURRENT_TIMESTAMP - INTERVAL '12 hours'
        AND end_time IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE staff_sessions 
    SET 
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        is_active = true 
        AND (
            access_expires_at < CURRENT_TIMESTAMP 
            OR refresh_expires_at < CURRENT_TIMESTAMP
        );
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Delete very old inactive sessions (older than 30 days)
    DELETE FROM staff_sessions 
    WHERE 
        is_active = false 
        AND updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- 11. SAMPLE DATA (for testing)
-- =====================================

-- Insert sample staff members for testing
INSERT INTO staff_members (
    employee_number, 
    email, 
    password_hash, 
    pin_hash,
    full_name, 
    phone_number, 
    role, 
    department,
    permissions,
    quick_switch_enabled
) VALUES
(
    'ST001', 
    'kitchen.head@ranbow.com', 
    '$2a$12$LQv3c1yqBwEHxlL5B4QZzOX8r9m.rYqHgOxQZzYFq1wUxNJ1x1234', -- password: kitchen123
    '$2a$12$ABC123DEFG456HIJK789LMNOP012345QRSTUV678WXYZ901234567', -- pin: 1234
    '廚房主廚 李師傅', 
    '+886-912-345-678', 
    'KITCHEN', 
    'Kitchen',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'KITCHEN_VIEW', 'KITCHEN_UPDATE', 'TIMER_MANAGE'],
    true
),
(
    'ST002', 
    'service.manager@ranbow.com', 
    '$2a$12$LQv3c1yqBwEHxlL5B4QZzOX8r9m.rYqHgOxQZzYFq2wUxNJ2x5678', -- password: service123
    '$2a$12$DEF456GHIJ789KLMN012PQRS345TUVA678BCDE901FGH234567890', -- pin: 5678
    '服務經理 王小姐', 
    '+886-912-456-789', 
    'SERVICE', 
    'Front of House',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'ORDER_CANCEL', 'STAFF_SWITCH'],
    true
),
(
    'ST003', 
    'admin@ranbow.com', 
    '$2a$12$LQv3c1yqBwEHxlL5B4QZzOX8r9m.rYqHgOxQZzYFq3wUxNJ3x9012', -- password: admin123
    '$2a$12$GHI789JKLM012NOPQ345RSTU678VWXY901ZABC234DEF567890123', -- pin: 9999
    '系統管理員 陳先生', 
    '+886-912-567-890', 
    'ADMIN', 
    'Administration',
    ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'ORDER_CANCEL', 'KITCHEN_VIEW', 'KITCHEN_UPDATE', 'TIMER_MANAGE', 'STAFF_SWITCH', 'REPORTS_VIEW', 'ADMIN_USERS', 'ADMIN_SYSTEM'],
    true
)
ON CONFLICT (employee_number) DO NOTHING;

-- Register sample devices
INSERT INTO device_registrations (device_id, device_name, device_type, location) VALUES
('TAB-KITCHEN-01', 'Kitchen Tablet 1', 'TABLET', 'Main Kitchen'),
('TAB-SERVICE-01', 'Service Tablet 1', 'TABLET', 'Front Counter'),
('POS-MAIN-01', 'Main POS Terminal', 'POS', 'Front Counter'),
('MOBILE-MANAGER-01', 'Manager Mobile Device', 'PHONE', 'Mobile')
ON CONFLICT (device_id) DO NOTHING;

-- =====================================
-- 12. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_staff_sessions_staff_active ON staff_sessions(staff_id, is_active, access_expires_at);
CREATE INDEX IF NOT EXISTS idx_order_assignments_staff_status ON order_assignments(staff_id, assignment_status, assigned_at);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_staff_active ON cooking_timers(staff_id, timer_status, started_at);
CREATE INDEX IF NOT EXISTS idx_staff_activities_staff_type_date ON staff_activities(staff_id, activity_type, created_at);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_staff_members_active_role ON staff_members(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_work_shifts_active ON work_shifts(staff_id, start_time) WHERE shift_status = 'ACTIVE';

-- =====================================
-- 13. DATABASE MAINTENANCE PROCEDURES
-- =====================================

-- Schedule cleanup procedures (run via cron or scheduled jobs)
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Run every hour to cleanup expired sessions';
COMMENT ON FUNCTION auto_end_expired_shifts() IS 'Run every hour to auto-end shifts that exceed 12 hours';

-- =====================================
-- SCRIPT COMPLETION
-- =====================================

-- Log successful completion
DO $$
BEGIN
    RAISE NOTICE 'Staff authentication database schema completed successfully at %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Tables created: staff_members, work_shifts, staff_sessions, order_assignments, cooking_timers, staff_activities, staff_permission_definitions, device_registrations';
    RAISE NOTICE 'Views created: active_staff_sessions, current_work_shifts, staff_performance_summary';
    RAISE NOTICE 'Functions created: update_updated_at_column, auto_end_expired_shifts, cleanup_expired_sessions';
    RAISE NOTICE 'Sample data inserted for testing purposes';
END $$;
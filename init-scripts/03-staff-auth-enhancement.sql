-- Enhanced Staff Authentication System Database Schema
-- Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
-- Adds JWT authentication, PIN support, work shifts, and enhanced tracking

-- ================================
-- ENHANCED STAFF MEMBERS TABLE
-- ================================

-- Enhanced staff_members table according to specification
CREATE TABLE IF NOT EXISTS staff_members (
    staff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255), -- For quick switch authentication
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('KITCHEN', 'SERVICE', 'CASHIER', 'MANAGER')),
    department VARCHAR(50),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    quick_switch_enabled BOOLEAN DEFAULT false,
    permissions TEXT[], -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create indexes for staff_members
CREATE INDEX IF NOT EXISTS idx_staff_members_employee_number ON staff_members(employee_number);
CREATE INDEX IF NOT EXISTS idx_staff_members_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_department ON staff_members(department);
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON staff_members(is_active);

-- ================================
-- WORK SHIFTS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS work_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    break_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for work_shifts
CREATE INDEX IF NOT EXISTS idx_work_shifts_staff_date ON work_shifts(staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_work_shifts_status ON work_shifts(status);
CREATE INDEX IF NOT EXISTS idx_work_shifts_start_time ON work_shifts(start_time);

-- ================================
-- STAFF ACTIVITIES TABLE
-- ================================

CREATE TABLE IF NOT EXISTS staff_activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('LOGIN', 'LOGOUT', 'ORDER_START', 'ORDER_UPDATE', 'ORDER_COMPLETE', 'BREAK_START', 'BREAK_END')),
    order_id VARCHAR(36), -- Reference to orders table
    description TEXT,
    duration_seconds INTEGER,
    metadata JSONB, -- Additional activity data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for staff_activities
CREATE INDEX IF NOT EXISTS idx_staff_activities_staff_type ON staff_activities(staff_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_staff_activities_created_at ON staff_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_activities_order_id ON staff_activities(order_id);

-- ================================
-- ORDER ASSIGNMENTS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS order_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(36) NOT NULL, -- Reference to orders.order_id
    staff_id UUID REFERENCES staff_members(staff_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    estimated_completion_time TIMESTAMP
);

-- Create indexes for order_assignments
CREATE INDEX IF NOT EXISTS idx_order_assignments_order_staff ON order_assignments(order_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_staff ON order_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_status ON order_assignments(status);
CREATE INDEX IF NOT EXISTS idx_order_assignments_assigned_at ON order_assignments(assigned_at);

-- ================================
-- COOKING TIMERS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS cooking_timers (
    timer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(36) NOT NULL, -- Reference to orders.order_id
    staff_id UUID REFERENCES staff_members(staff_id) ON DELETE SET NULL,
    start_time TIMESTAMP NOT NULL,
    pause_time TIMESTAMP,
    resume_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_duration INTEGER NOT NULL, -- seconds
    actual_duration INTEGER,
    paused_duration INTEGER DEFAULT 0, -- total paused time in seconds
    status VARCHAR(20) DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    alerts JSONB DEFAULT '{"halfTime": false, "nearComplete": false, "overdue": false}',
    notes TEXT
);

-- Create indexes for cooking_timers
CREATE INDEX IF NOT EXISTS idx_cooking_timers_order ON cooking_timers(order_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_staff ON cooking_timers(staff_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_status ON cooking_timers(status);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_start_time ON cooking_timers(start_time);

-- ================================
-- JWT SESSION MANAGEMENT TABLE
-- ================================

CREATE TABLE IF NOT EXISTS staff_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_members(staff_id) ON DELETE CASCADE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for staff_sessions
CREATE INDEX IF NOT EXISTS idx_staff_sessions_staff_id ON staff_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_access_token ON staff_sessions(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_refresh_token ON staff_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_device ON staff_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_expires_at ON staff_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_is_active ON staff_sessions(is_active);

-- ================================
-- SAMPLE DATA FOR TESTING
-- ================================

-- Insert sample staff members for testing (passwords hashed with BCrypt)
INSERT INTO staff_members (employee_number, email, password_hash, pin_hash, name, role, department, permissions, quick_switch_enabled) VALUES
('ST001', 'chef@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1ILtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '主廚李小華', 'KITCHEN', '廚房', ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'KITCHEN_MANAGE'], true),
('ST002', 'waiter@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1ILtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '服務員王大明', 'SERVICE', '服務', ARRAY['ORDER_VIEW', 'ORDER_UPDATE'], true),
('ST003', 'cashier@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1ILtKj0J.yIfLg7.7MQi1z2xNjTc3mS', NULL, '收銀員張小美', 'CASHIER', '收銀', ARRAY['ORDER_VIEW'], false),
('ST004', 'manager@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1ILtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '$2a$10$5H3dXSK8dT8VqPxQ9r7NkOJ4LtKj0J.yIfLg7.7MQi1z2xNjTc3mS', '經理陳大華', 'MANAGER', '管理', ARRAY['ORDER_VIEW', 'ORDER_UPDATE', 'KITCHEN_MANAGE', 'STAFF_MANAGE', 'SYSTEM_SETTINGS'], true)
ON CONFLICT (employee_number) DO NOTHING;

-- Insert sample work shifts
INSERT INTO work_shifts (staff_id, shift_date, start_time, end_time, status) 
SELECT 
    staff_id,
    CURRENT_DATE,
    CURRENT_DATE + TIME '09:00:00',
    CURRENT_DATE + TIME '18:00:00',
    'SCHEDULED'
FROM staff_members
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- ================================
-- ENHANCED FUNCTIONS
-- ================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE staff_sessions 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP OR refresh_expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to record staff activity
CREATE OR REPLACE FUNCTION record_staff_activity(
    p_staff_id UUID,
    p_activity_type VARCHAR(50),
    p_order_id VARCHAR(36) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO staff_activities (staff_id, activity_type, order_id, description, metadata)
    VALUES (p_staff_id, p_activity_type, p_order_id, p_description, p_metadata)
    RETURNING staff_activities.activity_id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to start work shift
CREATE OR REPLACE FUNCTION start_work_shift(p_staff_id UUID)
RETURNS UUID AS $$
DECLARE
    shift_id UUID;
BEGIN
    -- Update any active shift to completed
    UPDATE work_shifts 
    SET status = 'COMPLETED', actual_end = CURRENT_TIMESTAMP
    WHERE staff_id = p_staff_id AND status = 'ACTIVE';
    
    -- Create new shift or activate scheduled shift
    INSERT INTO work_shifts (staff_id, shift_date, start_time, actual_start, status)
    VALUES (p_staff_id, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE')
    ON CONFLICT (staff_id, shift_date) 
    DO UPDATE SET 
        actual_start = CURRENT_TIMESTAMP, 
        status = 'ACTIVE'
    RETURNING work_shifts.shift_id INTO shift_id;
    
    -- Record activity
    PERFORM record_staff_activity(p_staff_id, 'LOGIN', NULL, 'Shift started');
    
    RETURN shift_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end work shift
CREATE OR REPLACE FUNCTION end_work_shift(p_staff_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    shift_count INTEGER;
BEGIN
    UPDATE work_shifts 
    SET actual_end = CURRENT_TIMESTAMP, 
        status = 'COMPLETED',
        overtime_minutes = CASE 
            WHEN CURRENT_TIMESTAMP > end_time 
            THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - end_time))/60
            ELSE 0
        END
    WHERE staff_id = p_staff_id AND status = 'ACTIVE';
    
    GET DIAGNOSTICS shift_count = ROW_COUNT;
    
    IF shift_count > 0 THEN
        -- Record activity
        PERFORM record_staff_activity(p_staff_id, 'LOGOUT', NULL, 'Shift ended');
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================

-- Update staff_members updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_staff_members_updated_at
    BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_staff_members_updated_at();

-- Update session activity timestamp
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON staff_sessions
    FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ================================
-- VIEWS FOR ENHANCED REPORTING
-- ================================

-- Enhanced staff profile view
CREATE OR REPLACE VIEW staff_profiles AS
SELECT 
    sm.staff_id,
    sm.employee_number,
    sm.email,
    sm.name,
    sm.phone,
    sm.role,
    sm.department,
    sm.avatar_url,
    sm.is_active,
    sm.quick_switch_enabled,
    sm.permissions,
    sm.last_login_at,
    -- Current shift information
    ws.shift_id as current_shift_id,
    ws.start_time as shift_start_time,
    ws.end_time as shift_end_time,
    ws.actual_start as shift_actual_start,
    ws.status as shift_status,
    -- Session information
    COUNT(ss.session_id) as active_sessions,
    -- Activity counts
    COUNT(sa.activity_id) as daily_activities
FROM staff_members sm
LEFT JOIN work_shifts ws ON sm.staff_id = ws.staff_id 
    AND ws.shift_date = CURRENT_DATE 
    AND ws.status IN ('SCHEDULED', 'ACTIVE')
LEFT JOIN staff_sessions ss ON sm.staff_id = ss.staff_id 
    AND ss.is_active = true 
    AND ss.expires_at > CURRENT_TIMESTAMP
LEFT JOIN staff_activities sa ON sm.staff_id = sa.staff_id 
    AND sa.created_at >= CURRENT_DATE
WHERE sm.is_active = true
GROUP BY sm.staff_id, sm.employee_number, sm.email, sm.name, sm.phone, 
         sm.role, sm.department, sm.avatar_url, sm.is_active, sm.quick_switch_enabled,
         sm.permissions, sm.last_login_at, ws.shift_id, ws.start_time, 
         ws.end_time, ws.actual_start, ws.status;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Enhanced Staff Authentication System Setup Complete!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Created enhanced tables:';
    RAISE NOTICE '- staff_members (with JWT and PIN support)';
    RAISE NOTICE '- work_shifts (shift management)';
    RAISE NOTICE '- staff_activities (activity tracking)';
    RAISE NOTICE '- order_assignments (order assignment tracking)';
    RAISE NOTICE '- cooking_timers (kitchen timer management)';
    RAISE NOTICE '- staff_sessions (JWT session management)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created enhanced functions:';
    RAISE NOTICE '- cleanup_expired_sessions()';
    RAISE NOTICE '- record_staff_activity()';
    RAISE NOTICE '- start_work_shift()';
    RAISE NOTICE '- end_work_shift()';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample staff members created with default password: "password123"';
    RAISE NOTICE 'Enhanced system ready for authentication!';
END $$;
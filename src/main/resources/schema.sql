-- Create database (run this manually first if database doesn't exist)
-- CREATE DATABASE ranbow_restaurant;

-- Use the database
-- \c ranbow_restaurant;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS menu_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create custom ENUM types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'STAFF');
CREATE TYPE menu_category AS ENUM ('APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SOUP', 'SALAD', 'SIDE_DISH');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'LINE_PAY', 'APPLE_PAY', 'GOOGLE_PAY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- Users table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Menu items table
CREATE TABLE menu_items (
    item_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category menu_category NOT NULL,
    is_available BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    preparation_time INTEGER DEFAULT 15 CHECK (preparation_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    status order_status DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) DEFAULT 0 CHECK (subtotal >= 0),
    tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
    total_amount DECIMAL(10,2) DEFAULT 0 CHECK (total_amount >= 0),
    special_instructions TEXT,
    table_number VARCHAR(10) NOT NULL,
    order_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_time TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    order_item_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    special_requests TEXT,
    item_total DECIMAL(10,2) NOT NULL CHECK (item_total >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT
);

-- Payments table
CREATE TABLE payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    payment_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_time TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_name ON menu_items(name);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_time ON orders(order_time);
CREATE INDEX idx_orders_table_number ON orders(table_number);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_time ON payments(payment_time);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for menu_items updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default users
INSERT INTO users (user_id, username, email, phone_number, role, created_at, is_active) VALUES
    (gen_random_uuid()::text, 'admin', 'admin@ranbow.com', '0912345678', 'ADMIN', CURRENT_TIMESTAMP, true),
    (gen_random_uuid()::text, 'staff', 'staff@ranbow.com', '0987654321', 'STAFF', CURRENT_TIMESTAMP, true);

-- Insert default menu items
INSERT INTO menu_items (item_id, name, description, price, category, is_available, preparation_time, created_at, updated_at) VALUES
    (gen_random_uuid()::text, '炸雞翅', '酥脆多汁的炸雞翅', 180.00, 'APPETIZER', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '薯條', '金黃酥脆薯條', 80.00, 'APPETIZER', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '牛肉漢堡', '經典牛肉漢堡配薯條', 320.00, 'MAIN_COURSE', true, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '雞腿排', '香煎雞腿排佐蔬菜', 280.00, 'MAIN_COURSE', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '義大利麵', '奶油培根義大利麵', 250.00, 'MAIN_COURSE', true, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '可樂', '冰涼可口可樂', 50.00, 'BEVERAGE', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '咖啡', '香濃美式咖啡', 90.00, 'BEVERAGE', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '柳橙汁', '新鮮現榨柳橙汁', 80.00, 'BEVERAGE', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '巧克力蛋糕', '濃郁巧克力蛋糕', 120.00, 'DESSERT', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, '冰淇淋', '香草冰淇淋', 60.00, 'DESSERT', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Grant privileges (adjust as needed for production)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
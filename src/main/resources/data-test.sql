-- H2 Test Database Data
-- Initial test data for development and testing

-- 插入菜單類別
INSERT INTO menu_categories (name, description, sort_order) VALUES
('飲品', '各式飲品與茶類', 1),
('主食', '主要餐點', 2),
('小食', '輕食與點心', 3),
('甜點', '各式甜品', 4);

-- 插入菜單項目
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order) VALUES
(1, '珍珠奶茶', '經典珍珠奶茶', 45.00, true, 1),
(1, '檸檬綠茶', '清爽檸檬綠茶', 35.00, true, 2),
(1, '美式咖啡', '香濃美式咖啡', 40.00, true, 3),
(2, '牛肉麵', '紅燒牛肉麵', 120.00, true, 1),
(2, '雞肉飯', '嫩雞肉飯', 80.00, true, 2),
(2, '豬排便當', '炸豬排便當', 100.00, true, 3),
(3, '雞塊', '酥脆雞塊 6 塊', 60.00, true, 1),
(3, '薯條', '金黃薯條', 35.00, true, 2),
(3, '雞翅', '香烤雞翅 3 隻', 80.00, true, 3),
(4, '提拉米蘇', '義式提拉米蘇', 85.00, true, 1),
(4, '芝士蛋糕', '經典芝士蛋糕', 75.00, true, 2),
(4, '巧克力蛋糕', '濃郁巧克力蛋糕', 90.00, true, 3);

-- 創建測試管理員帳號（密碼: admin123）
-- 使用 BCrypt 雜湊值: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ranbow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系統管理員', 'ADMIN');

-- 創建測試用戶帳號（密碼: user123）
-- 使用 BCrypt 雜湊值: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpjBKt7w7WLzXQ2C
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('testuser', 'user@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpjBKt7w7WLzXQ2C', '測試用戶', 'USER');

-- 插入測試訂單
INSERT INTO orders (user_id, order_number, status, total_amount, payment_status, payment_method) VALUES
(2, 'ORDER-001', 'COMPLETED', 165.00, 'PAID', 'CREDIT_CARD'),
(2, 'ORDER-002', 'PENDING', 125.00, 'PENDING', null);

-- 插入測試訂單項目
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 45.00, 90.00),  -- 2杯珍珠奶茶
(1, 4, 1, 75.00, 75.00),  -- 1個芝士蛋糕
(2, 4, 1, 120.00, 120.00), -- 1碗牛肉麵
(2, 3, 1, 5.00, 5.00);    -- 1份薯條

-- 插入測試支付記錄
INSERT INTO payments (order_id, payment_method, amount, status, transaction_id) VALUES
(1, 'CREDIT_CARD', 165.00, 'SUCCESS', 'TXN-TEST-001');
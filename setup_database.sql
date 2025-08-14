-- 建立資料庫（如果不存在）
-- 請先在 PostgreSQL 中執行：CREATE DATABASE ranbow_restaurant;
-- 然後切換到該資料庫：\c ranbow_restaurant;

-- 或者可以使用以下命令行：
-- psql -h 192.168.0.114 -p 5432 -U postgres -c "CREATE DATABASE ranbow_restaurant;"
-- psql -h 192.168.0.114 -p 5432 -U postgres -d ranbow_restaurant -f setup_database.sql

-- 檢查是否可以連接
SELECT 'Database connection successful' as message;

-- 如果表格不存在，請執行 schema.sql 文件中的內容
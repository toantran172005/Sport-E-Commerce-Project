-- Địa chỉ giao hàng theo danh mục Giao Hàng Nhanh (GHN): hỗ trợ cả địa chỉ cũ (3 cấp) và mới (2 cấp).
-- Chạy trên Neon (DBeaver) TRƯỚC khi chạy backend mới vì spring.jpa.hibernate.ddl-auto=validate.
-- Idempotent: chạy lại nhiều lần không lỗi. Địa chỉ đang có sẽ mặc định là OLD, các cột GHN để NULL.
-- Cột mới cho phép NULL/có DEFAULT nên backend bản cũ của đồng đội vẫn chạy bình thường.

ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS address_scheme   VARCHAR(10) NOT NULL DEFAULT 'OLD';
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS ghn_province_id  INTEGER;
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS ghn_district_id  INTEGER;
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS ghn_ward_code    VARCHAR(20);

-- Kiểm tra
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses' AND column_name IN ('address_scheme','ghn_province_id','ghn_district_id','ghn_ward_code');

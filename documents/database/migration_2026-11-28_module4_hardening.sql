-- =====================================================================================
-- Migration: Module 4 hardening (thiết bị đăng nhập, hoàn tiền, an toàn kho/coupon)
-- Chạy trên Neon bằng DBeaver: bật Auto-commit, chạy TỪNG KHỐI (Ctrl+Enter trên từng khối DO $$ ... $$;)
-- Mọi khối đều idempotent (chạy lại nhiều lần không lỗi).
-- !!! BẮT BUỘC chạy khối 1 và 2 TRƯỚC khi chạy backend mới: ddl-auto=validate sẽ báo thiếu cột.
-- !!! Báo cho cả nhóm: DB Neon dùng chung, backend bản cũ vẫn chạy được sau khi thêm cột (cột mới cho phép NULL).
-- =====================================================================================

-- ---------- KHỐI 1: refresh_tokens - thông tin thiết bị (danh sách thiết bị đăng nhập) ----------
DO $$
BEGIN
    ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS ip_address   varchar(64);
    ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS user_agent   varchar(255);
    ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_used_at timestamptz;
END $$;

-- ---------- KHỐI 2: payments - theo dõi hoàn tiền thủ công ----------
DO $$
BEGIN
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_note varchar(255);
END $$;

-- ---------- KHỐI 3 (tùy chọn, khuyến nghị): tồn kho không được âm ----------
-- Nếu đang có dòng stock < 0 thì KHÔNG tạo ràng buộc, chỉ báo NOTICE để bạn sửa dữ liệu trước.
DO $$
DECLARE
    bad_rows integer;
BEGIN
    SELECT count(*) INTO bad_rows FROM product_variants WHERE stock < 0;
    IF bad_rows > 0 THEN
        RAISE NOTICE 'Bỏ qua: còn % biến thể có stock < 0. Sửa dữ liệu rồi chạy lại khối này.', bad_rows;
    ELSIF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_product_variants_stock_non_negative'
    ) THEN
        ALTER TABLE product_variants
            ADD CONSTRAINT chk_product_variants_stock_non_negative CHECK (stock >= 0);
    END IF;
END $$;

-- ---------- KHỐI 4 (tùy chọn, khuyến nghị): mỗi khách chỉ dùng 1 mã giảm giá 1 lần ----------
-- Chốt chặn cuối cùng ở DB cho trường hợp 2 đơn cùng lúc dùng cùng 1 mã. Nếu đã có dữ liệu trùng thì bỏ qua + báo.
DO $$
DECLARE
    dup_rows integer;
BEGIN
    SELECT count(*) INTO dup_rows FROM (
        SELECT coupon_id, user_id FROM coupon_usages GROUP BY coupon_id, user_id HAVING count(*) > 1
    ) d;
    IF dup_rows > 0 THEN
        RAISE NOTICE 'Bỏ qua: có % cặp (coupon, user) bị dùng nhiều lần. Xử lý dữ liệu trùng rồi chạy lại khối này.', dup_rows;
    ELSIF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'uq_coupon_usages_coupon_user'
    ) THEN
        CREATE UNIQUE INDEX uq_coupon_usages_coupon_user ON coupon_usages (coupon_id, user_id);
    END IF;
END $$;

-- ---------- KHỐI 5 (phòng thủ): CHECK của payments.status phải gồm đủ 5 giá trị enum ----------
-- Hibernate có thể đã sinh payments_status_check với danh sách cũ; tạo lại cho khớp PaymentStatus.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_status_check') THEN
        ALTER TABLE payments DROP CONSTRAINT payments_status_check;
    END IF;
    ALTER TABLE payments
        ADD CONSTRAINT payments_status_check
        CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUND', 'CANCELLED'));
END $$;

-- ---------- KIỂM TRA (chạy riêng sau khi xong) ----------
-- SELECT column_name, data_type FROM information_schema.columns
--  WHERE (table_name = 'refresh_tokens' AND column_name IN ('ip_address','user_agent','last_used_at'))
--     OR (table_name = 'payments'       AND column_name IN ('refunded_at','refund_note'));

-- ---------- ROLLBACK (chỉ khi cần) ----------
-- DROP INDEX IF EXISTS uq_coupon_usages_coupon_user;
-- ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS chk_product_variants_stock_non_negative;
-- (Không nên DROP các cột mới nếu backend bản mới đang chạy.)

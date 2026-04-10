-- Demo seed data for KienTruThiHanh
-- Run this in the Supabase SQL editor before the demo

-- 1. Clear existing org_reference data
TRUNCATE TABLE org_reference RESTART IDENTITY;

-- 2. Insert sample organization reference records
INSERT INTO org_reference (unit_name, address, tax_code, normalized_name) VALUES
  (
    'Trường Đại học Kiến Trúc Hà Nội',
    '1 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    '0100114734',
    'truong dai hoc kien truc ha noi'
  ),
  (
    'Học viện Công nghệ Bưu chính Viễn thông',
    'Km10 Nguyễn Trãi, Hà Đông, Hà Nội',
    '0100110360',
    'hoc vien cong nghe buu chinh vien thong'
  ),
  (
    'Trường Đại học Bách khoa Hà Nội',
    '1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    '0100104968',
    'truong dai hoc bach khoa ha noi'
  ),
  (
    'Trường Đại học Kinh tế Quốc dân',
    '207 Giải Phóng, Hai Bà Trưng, Hà Nội',
    '0100111346',
    'truong dai hoc kinh te quoc dan'
  ),
  (
    'Viện Hàn lâm Khoa học và Công nghệ Việt Nam',
    '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    '0100111579',
    'vien han lam khoa hoc va cong nghe viet nam'
  ),
  (
    'Viện kiểm sát nhân dân khu vực 5 – Đắk Lắk',
    'Khu trung tâm hành chính, xã Dray Bhăng, tỉnh Đắk Lắk',
    '6000930278',
    'vien kiem sat nhan dan khu vuc 5 dak lak'
  );

-- 3. Verify
SELECT id, unit_name, tax_code FROM org_reference ORDER BY id;

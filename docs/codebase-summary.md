# Codebase Summary: KienTruThiHanh (Cổng Dữ Liệu Nội Bộ VKS)

Báo cáo tổng kết cấu trúc mã nguồn (Codebase Summary).

## 1. Công nghệ & Kiến trúc Cơ bản
- **Framework:** Next.js 16.2 (App Router, Turbopack).
- **Backend/DB:** Supabase (PostgreSQL, Supabase Auth, Row-Level Security).
- **Ngôn ngữ:** TypeScript.
- **Styling:** Tailwind CSS V4 (chỉnh sữa theo phong cách Aurora Command Center/Apple Glass: Glassmorphism, bóng mờ gradient, rounded icons).
- **Form Management:** React Hook Form + Zod.
- **Icons & UI Feedback:** Lucide React, Sonner (Toasts).

## 2. Directory Structure Chính
- `src/app/(auth)/`: Chứa luồng xác thực (Login, Register). Đã phân tách thành Server/Client components để check quyền (Ví dụ layout bảo vệ trang `register`).
- `src/app/(protected)/`: Khu vực nội bộ yêu cầu đăng nhập (Dashboard, Analyze, Reports, Master Data, Workspace).
- `src/app/api/`: Endpoint Next.js (ví dụ `/api/admin/create-user` dùng Supabase Admin SDK cấp tài khoản chéo, `/api/master-items` xử lý danh mục).
- `src/lib/supabase/`: Helper functions cho DB connection (Client, Server, Service Role).

## 3. Các Phân hệ / Features Đã Hoàn thiện (Tính đến hiện tại)
1. **Luồng Xác thực & Bảo mật (Auth & Security):**
   - Đăng nhập, đăng ký bằng cơ chế Supabase Auth.
   - Cơ chế Admin Toggle chặn đăng ký tài khoản tự do (kiểm tra real-time thông qua biến `allow_registration` nằm trong DB `system_settings`).
2. **Quyền Quản trị Control Panel (Admin Workspace):**
   - Định dạng Cơ sở (Tên miền, Địa chỉ, Mã số thuế gốc chung cho toàn app).
   - Tự động chia tỷ lệ & Khởi tạo (Bulk generation) hàng loạt số lượng tài khoản (kèm mật khẩu ngẫu nhiên cấu trúc chuẩn), cho phép xuất CSV phân phối.
3. **Phân loại AI & Kế toán (Master Data):**
   - Lập danh mục vật tư cơ sở hạ tầng (Master items, versioning).
   - Module "Analyze" hỗ trợ duyệt, chiết xuất và map PDF báo cáo tài chính bằng AI sang Data nội bộ.
4. **Giao diện & UI/UX (Design System):**
   - Bố cục Sidebar Dashboard responsive (Bottom Nav cho thiết bị mobile kết hợp Popup "Bubble" hiện đại).
   - Giao diện Liquid/Apple Glass. Hoàn thiện hệ màu, transition và form loading animations.

## 4. Tình trạng và Công việc tiếp theo
- Code đã được đưa vào Git Repo an toàn (`origin/main`).
- Hệ thống chia quyền RLS đã hoạt động ổn định giữa `admin` profile và `user` bình thường.
- Các tab đã refactor sạch (Tách Client Component `login-form` độc lập khỏi `page`).

> *Tài liệu này được tạo tự động bởi AI Workflow `ck:docs summarize`.*

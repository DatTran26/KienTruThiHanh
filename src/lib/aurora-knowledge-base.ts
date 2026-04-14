/**
 * Aurora AI — System Knowledge Base
 * 
 * Chứa toàn bộ kiến thức về hệ thống VKS để inject vào System Prompt.
 * AI sẽ dùng kiến thức này để hướng dẫn user navigation, giải thích tính năng,
 * và tạo deep link điều hướng.
 */

// ════════════════════════════════════════
//  SYSTEM FEATURE MAP
// ════════════════════════════════════════

export const SYSTEM_KNOWLEDGE = `
--- BẢN ĐỒ TÍNH NĂNG HỆ THỐNG VKS ---

Em hiểu rõ TOÀN BỘ hệ thống với các trang và chức năng sau:

📌 1. PHÂN LOẠI CHI PHÍ AI (route: /analyze)
- Mô tả: Trang chính để phân loại chi phí ngân sách bằng AI. Nhập mô tả chi phí bằng ngôn ngữ tự nhiên → AI đề xuất mã tiểu mục TABMIS chính xác.
- Cách dùng: Nhập mô tả chi phí vào ô văn bản (ví dụ: "Chi phí xăng xe công tác 200.000đ") → Nhấn nút Gửi → AI trả kết quả gồm Nhóm mục, Tiểu mục, Độ chính xác → Chọn kết quả phù hợp → Lưu vào Báo cáo.
- Trên desktop: Menu bên trái → "Phân loại AI". Trên mobile: Thanh dưới → "Phân loại".
- Tính năng phụ: Bổ sung mô tả (thêm dữ liệu vào bảng kết quả hiện tại), Tạo mới (phân tích hoàn toàn mới), Bảng điều khiển bên phải (lịch sử + thống kê nhanh).
- Deeplink: [Mở Phân loại AI](/analyze)

📌 2. TỔNG QUAN / DASHBOARD (route: /dashboard)
- Mô tả: Bảng điều khiển tổng hợp, xem thống kê toàn bộ hệ thống: tổng phân tích, báo cáo, độ chính xác AI, biểu đồ chi phí theo tháng.
- Cách dùng: Xem số liệu tổng quan, click vào báo cáo gần đây để xem chi tiết, click "Tất cả" để vào trang Báo cáo.
- Trên desktop: Menu bên trái → "Tổng quan". Trên mobile: Thanh dưới → "Tổng quan".
- Deeplink: [Mở Tổng quan](/dashboard)

📌 3. KHO BÁO CÁO (route: /reports)
- Mô tả: Quản lý toàn bộ báo cáo hạch toán chi phí. Xem danh sách, tạo mới, xoá.
- Cách dùng: Nhấn "Tạo Báo Cáo Mới" để tạo phiếu trống → Đặt tên → Bắt đầu thêm khoản chi. Hoặc vào "Phân loại AI" để AI tạo khoản chi tự động rồi lưu vào đây.
- Tính năng phụ: Xác minh PDF (upload hóa đơn PDF để AI so khớp), Tạo báo cáo mới.
- Trên desktop: Menu bên trái → "Báo cáo". Trên mobile: Thanh dưới → "Báo cáo".
- Deeplink: [Mở Kho Báo cáo](/reports)

📌 4. CHI TIẾT BÁO CÁO (route: /reports/[id])
- Mô tả: Xem và chỉnh sửa chi tiết một phiếu báo cáo cụ thể. Bao gồm bảng khoản chi phí, chỉnh sửa inline, xuất PDF.
- Cách dùng: Từ trang "Kho Báo cáo" → Click vào một báo cáo → Xem chi tiết, sửa khoản mục, xuất PDF.
- Tính năng: Chỉnh sửa batch (sửa nhiều dòng cùng lúc), Xuất PDF (tạo phiếu hạch toán PDF chuyên nghiệp), Thêm khoản chi mới.

📌 5. HỒ SƠ TỔ CHỨC (route: /workspace)
- Mô tả: Quản lý thông tin đơn vị tổ chức và các cài đặt hệ thống (chỉ Admin).
- Trên desktop: Menu bên trái → "Hồ sơ Tổ chức". Trên mobile: Thanh dưới → "Hồ sơ" → chọn "Hồ sơ Đơn vị".
- Deeplink: [Mở Hồ sơ Tổ chức](/workspace)
  
  ⚙️ Tab "Định danh Cơ sở" (Admin only):
  - Cập nhật Tên đơn vị, Địa chỉ pháp lý, Mã số thuế gốc.
  - Thay đổi sẽ ảnh hưởng toàn bộ người dùng (tái định danh).
  - Deeplink: [Mở Định danh Cơ sở](/workspace?tab=org)
  
  ⚙️ Tab "Luồng Truy cập" (Admin only):
  - Bật/tắt cổng đăng ký tài khoản công khai (/register).
  - Khi TẮT: người mới sẽ không tự đăng ký được, chỉ Admin tạo tài khoản thủ công.
  - Deeplink: [Mở Luồng Truy cập](/workspace?tab=system)
  
  ⚙️ Tab "Cấp Tài khoản" (Admin only):
  - Tạo tài khoản ĐƠN LẺ: nhập email, mật khẩu, chọn role (User/Admin) → Khởi tạo.
  - Tạo tài khoản HÀNG LOẠT: chọn số lượng (slider tỉ lệ Admin/User) → Tự động sinh email/password → Xuất CSV hoặc Copy.
  - Deeplink: [Mở Cấp Tài khoản](/workspace?tab=users)

📌 6. KHO DỮ LIỆU / MASTER DATA (route: /master-data)
- Mô tả: Duyệt cây phân cấp Mục Lục Ngân Sách (MLNS/TABMIS). Tìm kiếm tiểu mục, xem lịch sử phiên bản.
- Cách dùng: Duyệt cây nhóm mục → mở rộng để xem tiểu mục con. Dùng thanh tìm kiếm để lọc nhanh. Panel bên phải hiển thị lịch sử các phiên bản dữ liệu.
- Admin: Upload file Excel mới → Xem trước → Phê duyệt & Triển khai thay thế dữ liệu cũ.
- Trên desktop: Menu bên trái → "Kho Dữ liệu". Trên mobile: Thanh dưới → "Kho dữ liệu".
- Deeplink: [Mở Kho Dữ liệu](/master-data)

📌 7. HỒ SƠ CÁ NHÂN (route: /user-profile)
- Mô tả: Xem thông tin tài khoản cá nhân (email, tên), cài đặt bảo mật.
- Trên desktop: Click vào avatar/tên ở góc dưới sidebar bên trái. Trên mobile: "Hồ sơ" → chọn "Hồ sơ Cán bộ".
- Deeplink: [Mở Hồ sơ Cá nhân](/user-profile)

--- HƯỚNG DẪN TẠO LINK ĐIỀU HƯỚNG ---
Khi hướng dẫn người dùng đi đến một trang, em LUÔN LUÔN tạo Markdown link dẫn trực tiếp. Ví dụ:
- "Anh/chị có thể nhấn 👉 [tại đây](/analyze) để tới trang Phân loại AI nha!"
- "Để tạo tài khoản, anh/chị vào 👉 [Cấp Tài khoản](/workspace?tab=users) ạ"
Lưu ý: Chỉ dùng internal link dạng /path (KHÔNG dùng full URL). User click sẽ được điều hướng ngay mà không cần rời trang.

--- PHÂN QUYỀN TRUY CẬP HỆ THỐNG (QUAN TRỌNG) ---

🔓 TÍNH NĂNG DÙNG CHUNG (Mọi người dùng):
- Phân loại Chi phí AI (/analyze)
- Tổng quan Dashboard (/dashboard)
- Kho Báo cáo (/reports) + Chi tiết Báo cáo (/reports/[id])
- Kho Dữ liệu (/master-data) — chỉ XEM, không upload/triển khai
- Hồ sơ Cá nhân (/user-profile)

🔒 TÍNH NĂNG CHỈ ADMIN (Quản trị viên):
- Hồ sơ Tổ chức > Định danh Cơ sở (/workspace?tab=org) — sửa tên đơn vị, MST, địa chỉ
- Hồ sơ Tổ chức > Luồng Truy cập (/workspace?tab=system) — bật/tắt đăng ký
- Hồ sơ Tổ chức > Cấp Tài khoản (/workspace?tab=users) — tạo tài khoản mới
- Kho Dữ liệu > Upload Excel + Triển khai phiên bản mới
- Tab "Quản trị Hệ thống" trong Hồ sơ Tổ chức

⚠️ QUY TẮC BẮT BUỘC:
- TRƯỚC KHI hướng dẫn bất kỳ tính năng nào, em PHẢI kiểm tra mục "THÔNG TIN NGƯỜI DÙNG ĐANG CHAT" bên dưới để biết vai trò (Admin hoặc User).
- Nếu người dùng là USER THƯỜNG mà hỏi về tính năng Admin → CẤM hướng dẫn chi tiết hoặc cung cấp deep link. Thay vào đó trả lời: "Dạ, chức năng [tên] chỉ dành cho Quản trị viên hệ thống thôi ạ 🔒. Anh/chị vui lòng liên hệ Admin của đơn vị để được hỗ trợ nha!"
- Nếu người dùng là ADMIN → hướng dẫn đầy đủ + cung cấp deep link.
- KHÔNG BAO GIỜ tự đoán vai trò. Chỉ dùng thông tin được cung cấp.

--- QUY TẮC TRẢ LỜI THỐNG KÊ ---
Khi trả lời câu hỏi về thống kê (trung bình, tổng, đếm...), em dùng SỐ LIỆU THỐNG KÊ THỰC TẾ được cung cấp bên dưới. KHÔNG tự bịa số liệu. Nếu dữ liệu cho thấy 0 hoặc trống, em thông báo rằng chưa có dữ liệu.
`;

// ════════════════════════════════════════
//  QUICK CHIPS — Gợi ý câu hỏi nhanh
// ════════════════════════════════════════

export interface QuickChip {
  label: string;
  message: string;
  icon: string; // emoji
  category: 'stats' | 'navigation' | 'domain' | 'quick';
}

const MORNING_CHIPS: QuickChip[] = [
  { label: 'Thống kê hôm qua', message: 'Cho em xem thống kê tổng quan hệ thống hôm qua', icon: '📊', category: 'stats' },
  { label: 'Bắt đầu phân tích', message: 'Hướng dẫn em cách phân tích chi phí bằng AI', icon: '🚀', category: 'navigation' },
];

const AFTERNOON_CHIPS: QuickChip[] = [
  { label: 'Tổng kết ngày', message: 'Tổng kết số liệu hệ thống trong ngày hôm nay', icon: '📋', category: 'stats' },
  { label: 'Xuất báo cáo', message: 'Hướng dẫn em cách xuất báo cáo PDF', icon: '📄', category: 'navigation' },
];

const EVENING_CHIPS: QuickChip[] = [
  { label: 'Tổng quan tuần', message: 'Cho em xem thống kê tổng quát của hệ thống', icon: '📈', category: 'stats' },
  { label: 'Kiểm tra kho dữ liệu', message: 'Kho dữ liệu đang dùng phiên bản nào?', icon: '🗄️', category: 'quick' },
];

const COMMON_STATS_CHIPS: QuickChip[] = [
  { label: 'Trung bình hoá đơn', message: 'Trung bình mỗi hoá đơn trong hệ thống là bao nhiêu?', icon: '💰', category: 'stats' },
  { label: 'Tổng chi phí', message: 'Tổng chi phí đã ghi nhận trong hệ thống là bao nhiêu?', icon: '💵', category: 'stats' },
  { label: 'Báo cáo tháng này', message: 'Tháng này có bao nhiêu báo cáo được tạo?', icon: '📊', category: 'stats' },
  { label: 'Độ chính xác AI', message: 'Độ chính xác trung bình của AI hiện tại là bao nhiêu phần trăm?', icon: '🎯', category: 'stats' },
  { label: 'Tổng phân tích', message: 'Hệ thống đã thực hiện bao nhiêu lượt phân tích?', icon: '🔍', category: 'stats' },
];

const COMMON_NAV_CHIPS: QuickChip[] = [
  { label: 'Tạo báo cáo mới', message: 'Hướng dẫn em cách tạo báo cáo mới', icon: '📝', category: 'navigation' },
  { label: 'Phân tích chi phí', message: 'Làm sao để phân tích chi phí bằng AI?', icon: '✨', category: 'navigation' },
  { label: 'Tạo tài khoản user', message: 'Hướng dẫn em cách tạo tài khoản cho người dùng mới', icon: '👤', category: 'navigation' },
  { label: 'Xem kho dữ liệu', message: 'Hướng dẫn em cách xem và tìm kiếm kho dữ liệu nghiệp vụ', icon: '🗄️', category: 'navigation' },
  { label: 'Xuất PDF', message: 'Làm sao để xuất phiếu hạch toán ra PDF?', icon: '📄', category: 'navigation' },
];

const COMMON_DOMAIN_CHIPS: QuickChip[] = [
  { label: 'Chi công tác phí', message: 'Chi công tác phí thuộc nhóm mục và tiểu mục nào?', icon: '🚗', category: 'domain' },
  { label: 'Tiểu mục 6500', message: 'Giải thích tiểu mục 6500 là gì và dùng khi nào?', icon: '📚', category: 'domain' },
  { label: 'Mua sắm thiết bị', message: 'Chi phí mua sắm thiết bị văn phòng phân loại vào mục nào?', icon: '🖥️', category: 'domain' },
  { label: 'Sửa chữa nhỏ', message: 'Chi phí sửa chữa nhỏ thuộc tiểu mục nào?', icon: '🔧', category: 'domain' },
];

/**
 * Lấy danh sách quick chips dựa trên thời gian hiện tại.
 * Mỗi lần gọi sẽ random chọn 5 chips: 1 time-based + 2 stats/nav + 2 domain.
 */
export function getQuickChips(): QuickChip[] {
  const hour = new Date().getHours();

  // Chọn chips theo buổi
  let timeChips: QuickChip[];
  if (hour >= 5 && hour < 12) {
    timeChips = MORNING_CHIPS;
  } else if (hour >= 12 && hour < 18) {
    timeChips = AFTERNOON_CHIPS;
  } else {
    timeChips = EVENING_CHIPS;
  }

  // Shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Pick 1 time-based + 2 from stats/nav pool + 2 from domain
  const timePick = shuffle(timeChips).slice(0, 1);
  const statsNavPool = shuffle([...COMMON_STATS_CHIPS, ...COMMON_NAV_CHIPS]);
  const statsNavPick = statsNavPool.slice(0, 2);
  const domainPick = shuffle(COMMON_DOMAIN_CHIPS).slice(0, 2);

  return [...timePick, ...statsNavPick, ...domainPick];
}

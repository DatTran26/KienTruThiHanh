import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { SYSTEM_KNOWLEDGE } from '@/lib/aurora-knowledge-base';

export const maxDuration = 60; // 60 seconds maximum duration

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `Dạ, bạn là Aurora AI ✨, một cô trợ lý vô cùng đáng yêu, thông minh và siêu tâm lý của "Hệ thống thông tin của VKS". (Lưu ý: Tuyệt đối không dùng tên hệ thống cũ "KienTruThiHanh" hay viết hẳn "Viện Kiểm Sát" ra nghe cứng nhắc lắm nha).
Bạn cực kỳ rành rọt về Hệ thống Mục Lục Ngân Sách (MLNS) của nhà nước Việt Nam, nhất là Thông tư 324/2016/TT-BTC luôn đó ạ 📚.
Nhiệm vụ của em là phụ giúp mọi người giải đáp thắc mắc về nghiệp vụ tài chính, kế toán, trích lục, cách hạch toán chi phí, VÀ hướng dẫn sử dụng các tính năng của hệ thống.
Về phong cách trò chuyện: Phải cực kỳ thân thiện, ngoan ngoãn và gần gũi như người nhà! Bắt buộc LUÔN LUÔN xưng "em" và gọi người dùng là "anh/chị" trong MỌI CÂU TRẢ LỜI (tuyệt đối không xưng "mình" hay gọi "bạn"). Chèn thật nhiều từ đệm dễ thương như "dạ", "vâng ạ", "nè", "nha", "hihi", "đó ạ" và thả thật nhiều emoji xinh xắn (🥰, ✨, 🌷, 💖, 📝, 💡) vào nhé! Tránh tuyệt đối giọng văn robot khô khan sáo rỗng.
Về cách trình bày: Dùng Markdown gọn gàng, chia bullet point dễ đọc nhưng đừng để thừa nhiều dòng trống nha.
Về chuyên môn: Em phải tra cứu thật kỹ KHO TÀI LIỆU được cấp bên dưới để tư vấn. Nếu có hỏi về định khoản, nhớ chỉ ra đúng Nhóm, Tiểu Mục có sẵn trong kho tài liệu thôi ạ 🔍.
Nếu có ai trêu ghẹo hỏi chuyện ngoài lề công việc, cứ ngoan ngoãn từ chối khéo rồi lái câu chuyện về lại nghiệp vụ tài chính nha 🎀.`;

// ── Format helpers ──
function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)} tỷ VNĐ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu VNĐ`;
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // ═══════════════════════════════════
    //  0. DETECT CURRENT USER ROLE
    // ═══════════════════════════════════
    const { data: { user } } = await supabase.auth.getUser();
    let userRole: 'admin' | 'user' = 'user';
    let userEmail = '';
    if (user) {
      userEmail = user.email || '';
      const { data: userRow } = await serviceSupabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = (userRow as any)?.role === 'admin' ? 'admin' : 'user';
    }

    // ═══════════════════════════════════
    //  1. FETCH REAL-TIME STATISTICS
    // ═══════════════════════════════════
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: totalAnalyses },
      { count: totalReports },
      { data: allReportItems },
      { data: recentAnalysis },
      { count: reportsThisMonth },
      { data: recentAnalyses },
      { data: activeVersion },
    ] = await Promise.all([
      // Total analyses
      supabase.from('analysis_requests').select('id', { count: 'exact', head: true }),
      // Total reports
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      // All report items for sum/avg
      supabase.from('report_items').select('amount'),
      // Most recent analysis
      supabase.from('analysis_requests').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      // Reports this month
      supabase.from('reports').select('id', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
      // Recent analyses for avg confidence
      supabase.from('analysis_requests').select('confidence').order('created_at', { ascending: false }).limit(50),
      // Active master version
      supabase.from('master_document_versions').select('version_no, item_count, doc_title').eq('is_active', true).maybeSingle(),
    ]);

    // Calculate stats
    const items = allReportItems ?? [];
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const nonZeroItems = items.filter(item => item.amount && item.amount > 0);
    const avgAmount = nonZeroItems.length > 0 ? totalAmount / nonZeroItems.length : 0;
    const avgConfidence = recentAnalyses && recentAnalyses.length > 0
      ? Math.round(recentAnalyses.reduce((s, a) => s + (a.confidence ?? 0), 0) / recentAnalyses.length * 100)
      : null;

    const statsText = `\n\n--- SỐ LIỆU THỐNG KÊ THỰC TẾ (Cập nhật real-time ${now.toLocaleString('vi-VN')}) ---
• Tổng lượt phân tích AI: ${totalAnalyses ?? 0}
• Tổng báo cáo đã tạo: ${totalReports ?? 0}
• Tổng chi phí ghi nhận: ${totalAmount > 0 ? formatVND(totalAmount) : 'Chưa có dữ liệu'}
• Trung bình mỗi khoản chi: ${avgAmount > 0 ? formatVND(avgAmount) : 'Chưa có dữ liệu'}
• Tổng số khoản chi: ${nonZeroItems.length}
• Báo cáo tháng này: ${reportsThisMonth ?? 0}
• Phân tích gần nhất: ${recentAnalysis?.created_at ? timeAgo(recentAnalysis.created_at) : 'Chưa có'}
• Độ chính xác AI trung bình: ${avgConfidence !== null ? `${avgConfidence}%` : 'Chưa đủ dữ liệu'}
• Kho dữ liệu: ${activeVersion ? `v${activeVersion.version_no} — ${activeVersion.doc_title || 'Dữ liệu chuẩn'} (${activeVersion.item_count} tiểu mục, đang sử dụng)` : 'Chưa có dữ liệu'}`;

    // ═══════════════════════════════════
    //  2. FETCH MLNS RAG DATA
    // ═══════════════════════════════════
    let masterDataText = "";
    if (activeVersion) {
      const { data: masterItems } = await supabase
        .from('master_items')
        .select('group_code, group_title, sub_code, sub_title, description')
        .eq('version_id', (activeVersion as any).id ?? '');
        
      if (masterItems && masterItems.length > 0) {
        masterDataText = "\n\n--- KHO TÀI LIỆU HỆ THỐNG HIỆN TẠI (Dữ liệu Nghiệp Vụ VKS MLNS) ---\n" + 
          masterItems.map(item => `+ Nhóm: ${item.group_code} (${item.group_title})\n  Tiểu mục: ${item.sub_code || 'N/A'} (${item.sub_title || 'N/A'})\n  Nội dung/Ví dụ: ${item.description || ''}`).join('\n\n');
      }
    }
    
    if (!masterDataText) {
      masterDataText = "\n\n--- KHO TÀI LIỆU HỆ THỐNG HIỆN TẠI ---\nKhông có dữ liệu.";
    }

    // ═══════════════════════════════════
    //  3. BUILD FULL PROMPT (with role context)
    // ═══════════════════════════════════
    const roleContext = `\n\n--- THÔNG TIN NGƯỜI DÙNG ĐANG CHAT ---\n• Email: ${userEmail || 'Không rõ'}\n• Vai trò: ${userRole === 'admin' ? 'QUẢN TRỊ VIÊN (Admin) — Có toàn quyền truy cập mọi tính năng.' : 'NGƯỜI DÙNG THƯỜNG (User) — Không có quyền truy cập các tính năng Admin.'}\n\nQUY TẮC BẮT BUỘC theo vai trò:\n${userRole === 'admin' 
  ? '- Người dùng này là Admin. Em có thể hướng dẫn đầy đủ mọi tính năng bao gồm: Cấp tài khoản, Luồng truy cập, Định danh cơ sở, Upload Master Data.\n- Khi hướng dẫn tạo tài khoản user, cung cấp deep link [Cấp Tài khoản](/workspace?tab=users).'
  : '- Người dùng này KHÔNG phải Admin. TUYỆT ĐỐI KHÔNG hướng dẫn các tính năng Admin như: Cấp tài khoản, Luồng truy cập, Upload Master Data, Định danh cơ sở.\n- Nếu họ hỏi về chức năng Admin, em phải nhẹ nhàng giải thích: "Dạ, chức năng này chỉ dành cho Quản trị viên hệ thống thôi ạ 🔒. Anh/chị vui lòng liên hệ Admin của đơn vị để được hỗ trợ nha!"\n- Chỉ hướng dẫn các tính năng User có quyền: Phân loại AI, Dashboard, Báo cáo, Kho Dữ liệu (xem), Hồ sơ Cá nhân.'
}`;

    const FULL_SYSTEM_PROMPT = SYSTEM_PROMPT + SYSTEM_KNOWLEDGE + roleContext + statsText + masterDataText;

    // Gửi request lên OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL && process.env.AI_MODEL !== "gpt-5" ? process.env.AI_MODEL : "gpt-4o-mini",
      messages: [
        { role: "system", content: FULL_SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.15,
      max_tokens: 2000,
    });

    return NextResponse.json({ 
      role: "assistant", 
      content: response.choices[0].message.content 
    });

  } catch (error: any) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json(
      { error: "AI Engine đang gặp sự cố kết nối, xin thử lại sau.", details: error.message }, 
      { status: 500 }
    );
  }
}

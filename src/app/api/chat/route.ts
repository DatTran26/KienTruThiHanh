import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // 60 seconds maximum duration

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `Bạn là Aurora AI ✨, trợ lý ảo thông minh, dễ thương và cực kỳ thân thiện của Viện Kiểm Sát (VKS) và hệ thống KienTruThiHanh. 
Bạn đọc và hiểu rất sâu về Hệ thống Mục Lục Ngân Sách (MLNS) của nhà nước Việt Nam (đặc biệt là Thông tư 324/2016/TT-BTC) 📚.
Nhiệm vụ của bạn là hỗ trợ, tư vấn và giải đáp các thắc mắc nghiệp vụ tài chính, kế toán, kiểm sát, và cách hạch toán chi phí cho người dùng.
Bạn hãy luôn nềm nở, xưng "mình" gọi "bạn" (hoặc xưng em/gọi anh chị), dùng từ ngữ giao tiếp tự nhiên, thân mật, chèn thêm các emoji xinh xắn (😊, ✨, 💼, 📊, 📝) để cuộc trò chuyện thật gần gũi nha! Khi trình bày, hãy dùng Markdown thật gọn gàng, tránh việc tạo ra nhiều dòng trống không cần thiết.
Tuyệt đối phải suy luận chặt chẽ bằng cách tra cứu trong KHO TÀI LIỆU được cung cấp bên dưới. Ưu tiên 100% theo Kho Tài Liệu của hệ thống 🔍.
Nếu câu hỏi liên quan đến định khoản chi phí, hãy phân tích và hướng dẫn người dùng chọn đúng Nhóm, Tiểu Mục đã có trong Kho Tài Liệu nhé 💡.
Nếu người dùng hỏi những việc không liên quan đến kế toán hay nghiệp vụ VKS, hãy dễ thương từ chối khéo léo và kéo họ về lại công việc nha 🎀.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch active master version's items to inject as RAG context
    let masterDataText = "\n\n--- KHO TÀI LIỆU HỆ THỐNG HIỆN TẠI ---\nKhông có dữ liệu.";
    const { data: activeVersion } = await supabase
      .from('master_document_versions')
      .select('id')
      .eq('is_active', true)
      .single();
      
    if (activeVersion) {
       const { data: items } = await supabase
         .from('master_items')
         .select('group_code, group_title, sub_code, sub_title, description')
         .eq('version_id', activeVersion.id);
         
       if (items && items.length > 0) {
          masterDataText = "\n\n--- KHO TÀI LIỆU HỆ THỐNG HIỆN TẠI (Dữ liệu Nghiệp Vụ VKS MLNS) ---\n" + 
            items.map(item => `+ Nhóm: ${item.group_code} (${item.group_title})\n  Tiểu mục: ${item.sub_code || 'N/A'} (${item.sub_title || 'N/A'})\n  Nội dung/Ví dụ: ${item.description || ''}`).join('\n\n');
       }
    }
    
    const FULL_SYSTEM_PROMPT = SYSTEM_PROMPT + masterDataText;

    // Gửi request lên OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL && process.env.AI_MODEL !== "gpt-5" ? process.env.AI_MODEL : "gpt-4o-mini", // Fallback if invalid model
      messages: [
        { role: "system", content: FULL_SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.1, // Precise and analytical mode (Low hallucination)
      max_tokens: 1500,
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

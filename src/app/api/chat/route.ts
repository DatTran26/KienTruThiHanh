import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // 60 seconds maximum duration

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `Dạ, bạn là Aurora AI ✨, một cô trợ lý vô cùng đáng yêu, thông minh và siêu tâm lý của "Hệ thống thông tin của VKS". (Lưu ý: Tuyệt đối không dùng tên hệ thống cũ "KienTruThiHanh" hay viết hẳn "Viện Kiểm Sát" ra nghe cứng nhắc lắm nha).
Bạn cực kỳ rành rọt về Hệ thống Mục Lục Ngân Sách (MLNS) của nhà nước Việt Nam, nhất là Thông tư 324/2016/TT-BTC luôn đó ạ 📚.
Nhiệm vụ của em là phụ giúp mọi người giải đáp thắc mắc về nghiệp vụ tài chính, kế toán, trích lục và cách hạch toán chi phí sao cho chuẩn chỉnh nhất.
Về phong cách trò chuyện: Phải cực kỳ thân thiện, ngọt ngào và gần gũi như người nhà! Hãy chủ động xưng "em" và gọi người dùng là "anh/chị" (hoặc xưng "mình" gọi "bạn" linh hoạt). Chèn thật nhiều từ đệm dễ thương như "dạ", "vâng ạ", "nè", "nha", "hihi", "đó ạ" và thả thật nhiều emoji xinh xắn (🥰, ✨, 🌷, 💖, 📝, 💡) vào nhé! Tránh tuyệt đối giọng văn robot khô khan sáo rỗng.
Về cách trình bày: Dùng Markdown gọn gàng, chia bullet point dễ đọc nhưng đừng để thừa nhiều dòng trống nha.
Về chuyên môn: Em phải tra cứu thật kỹ KHO TÀI LIỆU được cấp bên dưới để tư vấn. Nếu có hỏi về định khoản, nhớ chỉ ra đúng Nhóm, Tiểu Mục có sẵn trong kho tài liệu thôi ạ 🔍.
Nếu có ai trêu ghẹo hỏi chuyện ngoài lề công việc, cứ ngoan ngoãn từ chối khéo rồi lái câu chuyện về lại nghiệp vụ tài chính nha 🎀.`;

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

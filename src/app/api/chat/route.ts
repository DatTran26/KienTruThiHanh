import OpenAI from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 60 seconds maximum duration

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `Bạn là Aurora AI, trợ lý ảo thông minh và chuyên nghiệp của Viện Kiểm Sát (VKS) và hệ thống KienTruThiHanh. 
Bạn đọc và hiểu rất sâu về Hệ thống Mục Lục Ngân Sách (MLNS) của nhà nước Việt Nam (đặc biệt là Thông tư 324/2016/TT-BTC).
Nhiệm vụ của bạn là hỗ trợ, tư vấn và giải đáp các thắc mắc nghiệp vụ tài chính, kế toán, kiểm sát, và cách hạch toán chi phí cho người dùng (Thường là Admin hoặc Cán bộ).
Bạn hãy luôn giữ thái độ lịch sự, chuyên nghiệp, súc tích và trả lời đúng trọng tâm. Định dạng câu trả lời rõ ràng (dùng Markdown như in đậm, bullets nếu cần).
Nếu câu hỏi liên quan đến định khoản chi phí ngân sách, hãy phân tích và xác định rõ tên nhóm và tiểu mục (ví dụ Tiểu mục 6500, 6501, 6100...) dựa trên kiến thức ngân sách mà bạn có.
Nếu người dùng hỏi những việc không liên quan đến tài chính kế toán hoặc nghiệp vụ hành chính VKS, hãy lịch sự từ chối và hướng họ quay lại nghiệp vụ hệ thống.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Gửi request lên OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL && process.env.AI_MODEL !== "gpt-5" ? process.env.AI_MODEL : "gpt-4o-mini", // Fallback if invalid model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.2, // Precise and analytical mode
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

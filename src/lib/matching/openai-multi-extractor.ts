import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExtractedExpense {
  originalDesc: string;
  amount: number | null;
}

const SYSTEM_PROMPT = `Bạn là hệ thống bóc tách giao dịch tài chính.
Nhiệm vụ: Phân tích đoạn văn bản mô tả các khoản chi phí và trích xuất thành danh sách các khoản chi riêng biệt.
Nếu đoạn văn chỉ có 1 khoản chi, trả về mảng có 1 phần tử.
Nếu có nhiều khoản chi, hãy tách biệt rõ ràng từng khoản.

Định dạng trả về (CHỈ trả về JSON nguyên bản, không dùng \`\`\`json):
{
  "expenses": [
    {
      "originalDesc": "phụ cấp hướng dẫn cán bộ tập sự",
      "amount": 100000
    },
    {
      "originalDesc": "công tác phí tại Hà Nội trong 2 ngày",
      "amount": 1500000
    }
  ]
}
Chú ý: amount phải là số (number) hoặc null nếu không có số tiền.`;

export async function extractExpensesFromPrompt(description: string): Promise<ExtractedExpense[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [{ originalDesc: description, amount: null }]; // fallback
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response');

    const parsed = JSON.parse(raw);
    if (parsed.expenses && Array.isArray(parsed.expenses)) {
      return parsed.expenses;
    }
    return [{ originalDesc: description, amount: null }];
  } catch (err) {
    console.error('[openai-multi-extractor] Error:', err);
    return [{ originalDesc: description, amount: null }];
  }
}

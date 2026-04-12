import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert PDF to base64 for GPT-5 file input
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from('organization_profiles')
      .select('unit_name, address, tax_code')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('[verify-pdf] user_id:', user.id, 'profile:', profile, 'error:', profileError);

    if (!profile) {
      return NextResponse.json({ 
        error: profileError 
          ? `Lỗi truy vấn hồ sơ: ${profileError.message}` 
          : 'Chưa cấu hình Hồ sơ tổ chức. Vui lòng cập nhật trước khi kiểm tra PDF.' 
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Hệ thống chưa cấu hình AI Key.' }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `Bạn là trợ lý ảo chuyên trích xuất thông tin hành chính từ tài liệu tiếng Việt.
Hỗ trợ kiểm tra xem thông tin trên file PDF xuất ra (như hóa đơn, báo cáo...) có khớp với thông tin hồ sơ của đơn vị hay không.

Hãy trích xuất 3 thông tin sau từ file PDF đính kèm:
1. Tên đơn vị (Tên công ty/cơ quan)
2. Địa chỉ
3. Mã số thuế

Trả về CHỈ một JSON object (không giải thích thêm, không bọc markdown):
{
  "unit_name": "Tên chiết xuất được, hoặc rỗng nếu không tìm thấy",
  "address": "Địa chỉ chiết xuất được, hoặc rỗng",
  "tax_code": "Mã số thuế chiết xuất được, hoặc rỗng"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: {
                filename: file.name || 'document.pdf',
                file_data: `data:application/pdf;base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: 'Hãy trích xuất thông tin Tên đơn vị, Địa chỉ, và Mã số thuế từ file PDF này.',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    } as any);

    const raw = response.choices[0]?.message?.content;
    let extracted = { unit_name: '', address: '', tax_code: '' };
    if (raw) {
      try {
        extracted = JSON.parse(raw);
      } catch {
        // Parse error
      }
    }

    const normalize = (str: string) => (str || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, '');
    
    const checkField = (actual: string | null, extractedStr: string) => {
      if (!actual) return { isMatch: false, expected: '', extracted: extractedStr || 'Không tìm thấy' };
      const nActual = normalize(actual);
      const nExtracted = normalize(extractedStr);
      return {
        isMatch: nActual.length > 0 && nExtracted.length > 0 && (nExtracted.includes(nActual) || nActual.includes(nExtracted) || nActual === nExtracted),
        expected: actual,
        extracted: extractedStr || 'Không tìm thấy'
      };
    };

    const result = {
      unit_name: checkField(profile.unit_name, extracted.unit_name),
      address: checkField(profile.address, extracted.address),
      tax_code: checkField(profile.tax_code, extracted.tax_code),
    };

    const isAllMatch = result.unit_name.isMatch && result.address.isMatch && result.tax_code.isMatch;

    return NextResponse.json({
      success: true,
      isAllMatch,
      details: result
    });
  } catch (err) {
    console.error('[verify-pdf]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

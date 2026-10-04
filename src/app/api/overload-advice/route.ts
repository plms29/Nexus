import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

/** Quá thời gian này thì giao diện dùng lời giải thích dựng sẵn, demo không phải chờ */
const GEMINI_TIMEOUT_MS = 12000;

const SOLUTION_IDS = ['group', 'deadline', 'scope'] as const;
type SolutionId = (typeof SOLUTION_IDS)[number];

interface AdviceOption {
  id: SolutionId;
  title: string;
  /** Mô tả bằng số liệu đã tính sẵn ở client: tải ngày nặng nhất, LU mỗi học sinh... */
  facts: string;
  resolvesAll: boolean;
}

interface AdviceRequest {
  lang?: 'vi' | 'en';
  task: { title: string; subject: string; type: string; classId: string; deadline: string };
  situation: string;
  options: AdviceOption[];
  recommended: SolutionId;
}

/**
 * Nhờ Gemini viết lời giải thích ngắn cho từng phương án giảm tải.
 * Số liệu (LU, ngày quá tải, cỡ nhóm) do engine tính và gửi kèm, AI chỉ được diễn giải
 * và chọn phương án nên ưu tiên, không được tự bịa số mới.
 */
export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API Key is not configured on the server.' }, { status: 503 });
  }

  try {
    const body = (await req.json()) as AdviceRequest;
    const english = body.lang === 'en';

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    });

    const prompt = `
Bạn là trợ lý ExamLoad Radar giúp giáo viên THPT Việt Nam tránh làm học sinh quá tải.
Ngưỡng: 1 LU = 30 phút, tối đa 5 LU/ngày (150 phút) và 25 LU/tuần; lớp ban tự nhiên dành 70% quỹ tuần cho môn tự nhiên.
Công thức làm nhóm: LU mỗi thành viên = phần việc bắt buộc tự làm (đọc hiểu đề + phần được phân công) + điều phối (họp nhóm 15 phút + tập duyệt 30 phút).

Bài đang giao: "${body.task.title}" - môn ${body.task.subject} - dạng ${body.task.type} - lớp ${body.task.classId} - hạn nộp ${body.task.deadline}.
Tình trạng: ${body.situation}

Các phương án hệ thống đã tính thử trên Workmap thật của lớp (CHỈ dùng đúng các con số này, không tự tạo số mới):
${body.options.map(o => `- [${o.id}] ${o.title}: ${o.facts} => ${o.resolvesAll ? 'gỡ được quá tải' : 'CHƯA gỡ hết quá tải'}`).join('\n')}

Hệ thống đang đề xuất: ${body.recommended}.

Yêu cầu:
- Chọn phương án nên ưu tiên ("recommended", một trong ${SOLUTION_IDS.join(', ')}), ưu tiên phương án gỡ được quá tải mà vẫn giữ mục tiêu học tập.
- "headline": 1 câu tóm tắt tình huống và lời khuyên chính cho giáo viên.
- "rationales": với mỗi phương án, 1-2 câu giải thích lợi ích và đánh đổi về mặt sư phạm (học sinh học được gì, mất gì).
- Viết bằng ${english ? 'TIẾNG ANH' : 'TIẾNG VIỆT'}, giọng đồng nghiệp, ngắn gọn.

Trả về JSON: {"recommended": "...", "headline": "...", "rationales": {"group": "...", "deadline": "...", "scope": "..."}}
`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), GEMINI_TIMEOUT_MS)),
    ]);

    const parsed = JSON.parse(result.response.text());
    const recommended: SolutionId = SOLUTION_IDS.includes(parsed.recommended) ? parsed.recommended : body.recommended;

    return NextResponse.json({
      recommended,
      headline: String(parsed.headline || ''),
      rationales: {
        group: String(parsed.rationales?.group || ''),
        deadline: String(parsed.rationales?.deadline || ''),
        scope: String(parsed.rationales?.scope || ''),
      },
    });
  } catch (error) {
    console.error('Error calling Gemini for overload advice:', error);
    return NextResponse.json({ error: 'Failed to generate advice' }, { status: 502 });
  }
}

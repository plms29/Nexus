import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API Key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const { title, type, subject } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
    Tôi đang giao một bài tập cho học sinh với thông tin sau:
    - Tên bài: ${title}
    - Môn học: ${subject}
    - Dạng bài: ${type}
    
    Hãy đóng vai trò là một trợ lý giáo dục (ExamLoad Radar). Đánh giá nhanh về khối lượng công việc (Workload) dự kiến cho bài tập này.
    Nếu bài tập này có thể tốn nhiều thời gian (trên 150 phút), hãy gợi ý cách chia nhỏ bài tập này ra nhiều ngày (ví dụ: ngày 1 làm dàn ý, ngày 2 viết nháp...) để tránh học sinh bị quá tải.
    Chỉ trả về phần gợi ý ngắn gọn, rõ ràng (khoảng 3-4 câu).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ suggestion: text });
  } catch (error: any) {
    console.error('Error calling Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to analyze workload' },
      { status: 500 }
    );
  }
}

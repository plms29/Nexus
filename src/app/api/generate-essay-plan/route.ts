import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

interface ProcessStep {
  id: string;
  stepName: string;
  minutes: number;
  note: string;
}

interface OutlineItem {
  id: string;
  text: string;
}

export async function POST(req: Request) {
  try {
    const { title, topic, subject = 'Ngữ văn', classId = '10A', language, taskType = 'essay' } = await req.json();

    const isForeignLang = 
      (language && language.toLowerCase().includes('anh')) ||
      (subject && (subject.toLowerCase().includes('anh') || subject.toLowerCase().includes('english') || subject.toLowerCase().includes('trung') || subject.toLowerCase().includes('pháp')));

    const fullPromptContext = topic ? `${title} - Nêu nội dung: ${topic}` : title;

    // If Gemini key is available, call Gemini API
    if (apiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const taskTypeLabel = taskType === 'chart' ? 'VẼ & PHÂN TÍCH BIỂU ĐỒ' : taskType === 'project' ? 'THỰC HIỆN DỰ ÁN' : 'VIẾT BÀI ESSAY';

        const prompt = `
        Bạn là Trợ lý Giáo dục AI (ExamLoad Radar).
        Nhiệm vụ: Phân tích độ khó & tính thời gian LÀM BÀI TẬP THPT (${taskTypeLabel}) thực tế (TỔNG THỜI GIAN KHÔNG VƯỢT QUÁ 180 PHÚT):

        [THÔNG TIN BÀI TẬP]
        - Tên/Đề bài: "${fullPromptContext || title || 'Bài tập'}"
        - Dạng bài: ${taskTypeLabel} (${taskType})
        - Nội dung chi tiết: "${topic || title || ''}"
        - Bộ môn: ${subject}
        - Lớp: ${classId}
        - Ngôn ngữ: ${isForeignLang ? 'Tiếng Anh / Ngoại ngữ' : 'Tiếng Việt'}

        [QUY TẮC PHÂN BỔ THỜI GIAN THỰC TẾ (BẮT BỘC TUÂN THỦ)]
        Tổng thời gian làm bài của học sinh THPT cho bài viết/dự án/biểu đồ này phải từ 60 phút đến 160 phút (TUYỆT ĐỐI KHÔNG VƯỢT QUÁ 180 PHÚT):
        - Tạo 4 đến 7 bước thực hiện chi tiết với thời gian (phút) phù hợp cho từng bước.
        - Sinh Khung Dàn Ý Gợi Ý (Outline) 4-7 mục chi tiết bám sát bài tập "${title}".

        Trả về duy nhất dữ liệu JSON nguyên bản với cấu trúc:
        {
          "steps": [
            { "id": "p1", "stepName": "Bước 1: ...", "minutes": 15, "note": "..." }
          ],
          "outline": [
            { "id": "o1", "text": "1. ..." }
          ],
          "languageNotes": "..."
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        if (parsed.steps && parsed.outline) {
          const sanitizedSteps = parsed.steps.map((s: any) => {
            let m = Math.max(5, parseInt(s.minutes) || 15);
            m = Math.min(90, m);
            return { ...s, minutes: m };
          });

          const totalMinutes = sanitizedSteps.reduce((acc: number, s: any) => acc + s.minutes, 0);
          return NextResponse.json({
            success: true,
            steps: sanitizedSteps,
            outline: parsed.outline,
            totalMinutes,
            languageNotes: parsed.languageNotes || (isForeignLang ? 'Bài Tiếng Anh thêm thời gian từ vựng & ngữ pháp.' : 'Thời gian phân bổ theo chuẩn năng lực THPT.')
          });
        }
      } catch (err) {
        console.warn('Gemini API call warning, fallback to smart rule engine:', err);
      }
    }

    // Smart Dynamic Fallback Generator based on taskType
    const baseMultiplier = isForeignLang ? 1.3 : 1.0;
    let steps: ProcessStep[] = [];
    let outline: OutlineItem[] = [];

    const safeTitle = title || 'Bài tập rèn luyện tư học và kỹ năng';

    if (taskType === 'chart') {
      steps = [
        { id: 'p1', stepName: 'Đọc hiểu số liệu và xác định mục tiêu biểu đồ', minutes: Math.round(15 * baseMultiplier), note: 'Nắm rõ bộ số liệu và các chỉ số cần thể hiện' },
        { id: 'p2', stepName: 'Xử lý, tính toán số liệu và phân loại dữ liệu', minutes: Math.round(20 * baseMultiplier), note: 'Tính toán tỷ lệ %, xử lý chênh lệch số liệu' },
        { id: 'p3', stepName: 'Lựa chọn dạng biểu đồ thích hợp và dựng khung/trục', minutes: 15, note: 'Xác định dạng cột, đường, tròn hoặc kết hợp' },
        { id: 'p4', stepName: 'Vẽ biểu đồ chi tiết và điền chú giải', minutes: 30, note: 'Vẽ chính xác tỷ lệ, điền đầy đủ chú giải và đơn vị' },
        { id: 'p5', stepName: 'Nhận xét, phân tích xu hướng và rút ra kết luận', minutes: Math.round(25 * baseMultiplier), note: 'Phân tích điểm nổi bật, nhận xét khái quát & chi tiết' },
        { id: 'p6', stepName: 'Rà soát, kiểm tra độ chính xác và hoàn thiện', minutes: 10, note: 'Kiểm tra khớp số liệu và tên biểu đồ' },
      ];
      outline = [
        { id: 'o1', text: `1. Tên biểu đồ: ${safeTitle} - Tóm tắt mục tiêu thể hiện số liệu` },
        { id: 'o2', text: '2. Bảng số liệu đã xử lý & đơn vị tính chính xác' },
        { id: 'o3', text: '3. Dạng biểu đồ lựa chọn (Cột, Đường, Tròn, Kết hợp...) & Lý do lựa chọn' },
        { id: 'o4', text: '4. Nhận xét tổng quan: Đánh giá xu hướng chung, nhận xét khái quát' },
        { id: 'o5', text: '5. Nhận xét chi tiết: So sánh các mốc thời gian, đối tượng, giá trị cao/thấp nhất' },
        { id: 'o6', text: '6. Giải thích nguyên nhân & Rút ra kết luận / dự báo' }
      ];
    } else if (taskType === 'project') {
      steps = [
        { id: 'p1', stepName: 'Lên kế hoạch dự án và phân công mục tiêu', minutes: 30, note: 'Xác định phạm vi, vai trò thành viên và mốc hoàn thành' },
        { id: 'p2', stepName: 'Thu thập dữ liệu và tài liệu nghiên cứu', minutes: Math.round(60 * baseMultiplier), note: 'Khảo sát, thu thập thông tin và tổng hợp tư liệu' },
        { id: 'p3', stepName: 'Thực hiện và tổng hợp sản phẩm dự án', minutes: Math.round(90 * baseMultiplier), note: 'Xây dựng nội dung, mô hình hoặc bài báo cáo' },
        { id: 'p4', stepName: 'Đánh giá, hoàn thiện và chuẩn bị báo cáo/thuyết trình', minutes: 30, note: 'Tổng duyệt sản phẩm và tập luyện thuyết trình' },
      ];
      outline = [
        { id: 'o1', text: `1. Mục tiêu & Phạm vi thực hiện dự án: ${safeTitle}` },
        { id: 'o2', text: '2. Kế hoạch phân công công việc & Tiến độ chi tiết' },
        { id: 'o3', text: '3. Nội dung thu thập & Kết quả nghiên cứu thực tế' },
        { id: 'o4', text: '4. Tổng kết sản phẩm, bài học kinh nghiệm & Đánh giá kết quả' }
      ];
    } else {
      // essay or default
      steps = [
        { id: 'p1', stepName: 'Đọc hiểu đề và xác định phạm vi nội dung', minutes: Math.round(15 * baseMultiplier), note: isForeignLang ? 'Đọc kỹ prompt, xác định yêu cầu từ vựng & cấu trúc ngữ pháp' : 'Đọc kỹ yêu cầu đề, xác định phạm vi nội dung' },
        { id: 'p2', stepName: 'Tra cứu thông tin và kiểm tra lại tính xác thực', minutes: Math.round(20 * baseMultiplier), note: isForeignLang ? 'Tra cứu các từ vựng chuyên ngành & bài mẫu' : 'Tìm kiếm các tài liệu, nguồn thông tin uy tín' },
        { id: 'p3', stepName: 'Xác định từ khóa/ý chính và luận điểm', minutes: Math.round(10 * baseMultiplier), note: isForeignLang ? 'Xác định Thesis Statement & Topic Sentences' : 'Đúc rút các luận điểm cốt lõi' },
        { id: 'p4', stepName: 'Lập dàn ý chi tiết', minutes: Math.round(10 * baseMultiplier), note: 'Xây dựng khung bài viết gồm Mở - Thân - Kết' },
        { id: 'p5', stepName: isForeignLang ? 'Viết essay (Chú ý Coherence & Transition Words)' : 'Viết essay', minutes: Math.round(45 * baseMultiplier), note: isForeignLang ? 'Tập trung viết câu phức, kiểm tra liên kết giữa các đoạn văn' : 'Tập trung viết mạch lạc, liên kết ý tốt' },
        { id: 'p6', stepName: isForeignLang ? 'Rà soát Grammarly/Lỗi chính tả & Từ vựng' : 'Đọc lại bài, chỉnh sửa, kiểm tra lỗi và hoàn thiện', minutes: Math.round(15 * baseMultiplier), note: isForeignLang ? 'Chỉnh sửa lỗi thì (tenses), hòa hợp chủ vị & spelling' : 'Chỉnh sửa lỗi chính tả, câu chữ, diễn đạt' },
        { id: 'p7', stepName: 'Tổng hợp lại các tài liệu tham khảo (Trình bày link)', minutes: 5, note: 'Liệt kê danh mục tài liệu tham khảo theo đúng chuẩn' },
      ];
      outline = [
        { id: 'o1', text: `Mở bài: Dẫn dắt vấn đề về "${safeTitle}" và nêu nhận định chung định hướng.` },
        { id: 'o2', text: `Thân bài - Giải thích khái niệm: Làm rõ bản chất và phạm vi của bài viết.` },
        { id: 'o3', text: `Thân bài - Phân tích thực trạng: Chỉ ra cơ hội và thách thức thực tế.` },
        { id: 'o4', text: `Thân bài - Vai trò và ý nghĩa: Đánh giá tác động đến cá nhân và cộng đồng.` },
        { id: 'o5', text: `Thân bài - Dẫn chứng minh họa: Đưa ra ví dụ cụ thể, thuyết phục.` },
        { id: 'o6', text: `Thân bài - Đề xuất giải pháp / Phản đề: Các bước hành động rèn luyện cụ thể.` },
        { id: 'o7', text: `Kết bài: Khẳng định lại tầm quan trọng và bài học nhận thức bản thân.` },
      ];
    }

    const totalMinutes = steps.reduce((acc, s) => acc + s.minutes, 0);

    return NextResponse.json({
      success: true,
      steps,
      outline,
      totalMinutes,
      languageNotes: isForeignLang 
        ? 'Dự báo học sinh làm bài bằng Tiếng Anh: Tăng thêm ~30% thời gian cho khâu chọn từ vựng, kiểm tra ngữ pháp và liên kết đoạn.' 
        : 'Phân bổ thời gian chuẩn bám sát khung năng lực THPT.'
    });

  } catch (error: any) {
    console.error('Error generating essay plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    );
  }
}

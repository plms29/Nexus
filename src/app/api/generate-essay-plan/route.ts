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

/**
 * Bỏ số phút AI hay chèn vào tên bước, ví dụ "Bước 1: Đọc lướt (10 phút)".
 * Số phút đã có ô riêng trong bảng nên để hai chỗ thì giáo viên phải sửa hai lần.
 */
const stripMinutesFromName = (name: string): string =>
  (name || '')
    .replace(/[\(\[]\s*(khoảng\s*|~\s*)?\d+\s*(-\s*\d+\s*)?(phút|phut|p|min|mins|minutes)\s*[\)\]]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([:.,;])/g, '$1')
    .trim();

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

        const taskTypeLabels: Record<string, string> = {
          chart: 'VẼ & PHÂN TÍCH BIỂU ĐỒ',
          project: 'THỰC HIỆN DỰ ÁN',
          mindmap_short: 'VẼ SƠ ĐỒ TƯ DUY CHO 1-2 BÀI',
          mindmap_long: 'VẼ SƠ ĐỒ TƯ DUY TỔNG HỢP CẢ CHƯƠNG',
          presentation_individual: 'CHUẨN BỊ BÀI THUYẾT TRÌNH CÁ NHÂN',
          presentation_group: 'CHUẨN BỊ BÀI THUYẾT TRÌNH NHÓM',
        };
        const taskTypeLabel = taskTypeLabels[taskType] || 'VIẾT BÀI ESSAY';

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

        [QUY TẮC ĐẶT TÊN BƯỚC]
        - TUYỆT ĐỐI KHÔNG ghi số phút trong "stepName" (không viết "(10 phút)", "- 15 phút", "~20 phút").
          Số phút chỉ nằm ở trường "minutes".
        - Tên bước phải nói rõ HỌC SINH LÀM GÌ VỚI NỘI DUNG CỤ THỂ của đề bài
          (nêu đúng tên chương/bài/số liệu/khái niệm trong đề), không dùng câu chung chung
          kiểu "Đọc hiểu đề", "Tìm tài liệu".

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
            return { ...s, stepName: stripMinutesFromName(s.stepName), minutes: m };
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
    } else if (taskType === 'mindmap_short' || taskType === 'mindmap_long') {
      const isLong = taskType === 'mindmap_long';
      const scale = isLong ? 2.4 : 1;
      steps = [
        { id: 'p1', stepName: isLong ? 'Đọc lại toàn bộ chương và hệ thống vở ghi' : 'Đọc lại bài/chương và xem vở ghi', minutes: Math.round(10 * scale * baseMultiplier), note: 'Nắm lại toàn bộ nội dung cần hệ thống hoá' },
        { id: 'p2', stepName: 'Chọn lọc thông tin, rút ý chính', minutes: Math.round(15 * scale * baseMultiplier), note: 'Gạch chân từ khoá, loại bỏ chi tiết phụ' },
        { id: 'p3', stepName: 'Chia nhánh và sắp xếp theo cấu trúc', minutes: Math.round(15 * scale), note: 'Xác định nhánh chính, nhánh phụ và thứ bậc' },
        { id: 'p4', stepName: 'Vẽ sơ đồ tư duy', minutes: Math.round(15 * scale), note: 'Trình bày bằng màu sắc, hình khối dễ ghi nhớ' },
        { id: 'p5', stepName: isLong ? 'Rà soát, bổ sung liên kết giữa các nhánh' : 'Kiểm tra lại', minutes: Math.round(5 * scale), note: 'Đối chiếu với sách giáo khoa xem đã đủ ý chưa' },
      ];
      outline = [
        { id: 'o1', text: `1. Chủ đề trung tâm: ${safeTitle}` },
        { id: 'o2', text: '2. Các nhánh chính (mỗi nhánh là một đơn vị kiến thức lớn)' },
        { id: 'o3', text: '3. Nhánh phụ và từ khoá cho từng nhánh chính' },
        { id: 'o4', text: '4. Ví dụ hoặc công thức minh hoạ gắn với từng nhánh' },
        ...(isLong ? [{ id: 'o5', text: '5. Liên kết ngang giữa các nhánh, chỉ ra mối quan hệ kiến thức' }] : []),
      ];
    } else if (taskType === 'presentation_individual' || taskType === 'presentation_group') {
      const isGroupPresentation = taskType === 'presentation_group';
      steps = [
        ...(isGroupPresentation
          ? [{ id: 'p0', stepName: 'Họp nhóm phân chia công việc và rà soát', minutes: 15, note: 'Thống nhất nội dung, phân vai và mốc thời gian' }]
          : []),
        { id: 'p1', stepName: 'Đọc hiểu đề, xác định phạm vi và mục tiêu trình bày', minutes: Math.round(15 * baseMultiplier), note: 'Xác định thông điệp chính muốn người nghe nhớ' },
        { id: 'p2', stepName: 'Tra cứu tài liệu và chọn lọc dẫn chứng', minutes: Math.round(30 * baseMultiplier), note: 'Ưu tiên số liệu, ví dụ thực tế thuyết phục' },
        { id: 'p3', stepName: 'Xây dựng dàn ý và nội dung slide', minutes: Math.round(30 * baseMultiplier), note: 'Mỗi slide một ý, tránh chép nguyên đoạn văn' },
        { id: 'p4', stepName: 'Thiết kế slide và hình ảnh minh hoạ', minutes: 30, note: 'Chú ý cỡ chữ, tương phản màu để nhìn rõ từ xa' },
        { id: 'p5', stepName: 'Tổng hợp nguồn tham khảo', minutes: 10, note: 'Ghi rõ nguồn cho mọi số liệu và hình ảnh' },
        { id: 'p6', stepName: 'Luyện nói và bấm giờ phần trình bày', minutes: Math.round(25 * baseMultiplier), note: 'Tập nói thành tiếng, canh đúng thời lượng cho phép' },
        ...(isGroupPresentation
          ? [{ id: 'p7', stepName: 'Tập duyệt trình bày sản phẩm cùng nhóm', minutes: 30, note: 'Ghép phần các thành viên, xử lý chuyển tiếp' }]
          : []),
      ];
      outline = [
        { id: 'o1', text: `1. Mở đầu: Giới thiệu chủ đề "${safeTitle}" và thông điệp chính` },
        { id: 'o2', text: '2. Bối cảnh và lý do chủ đề này đáng quan tâm' },
        { id: 'o3', text: '3. Nội dung trọng tâm 1 kèm dẫn chứng cụ thể' },
        { id: 'o4', text: '4. Nội dung trọng tâm 2 kèm số liệu hoặc ví dụ' },
        { id: 'o5', text: '5. Liên hệ thực tế với bản thân và lớp học' },
        { id: 'o6', text: '6. Kết luận và câu hỏi thảo luận cho người nghe' },
        ...(isGroupPresentation
          ? [{ id: 'o7', text: '7. Bảng phân công: ai trình bày phần nào, thời lượng bao lâu' }]
          : []),
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

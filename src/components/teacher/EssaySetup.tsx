import { useState } from 'react';
import { Sparkles, Trash2, Plus, Clock, FileText, Loader2 } from 'lucide-react';

interface OutlineItem {
  id: string;
  text: string;
}

interface ProcessStep {
  id: string;
  stepName: string;
  minutes: number;
  note: string;
}

export default function EssaySetup() {
  // Outline State
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [newOutlineText, setNewOutlineText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Process State
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { id: 'p1', stepName: 'Đọc hiểu để và xác định phạm vi nội dung', minutes: 15, note: 'Đọc kỹ yêu cầu đề, xác định' },
    { id: 'p2', stepName: 'Tra cứu thông tin và kiểm tra lại tính xác thực', minutes: 20, note: 'Tìm kiếm các tài liệu, nguồn' },
    { id: 'p3', stepName: 'Xác định từ khóa/ý chính và luận điểm', minutes: 10, note: 'Đúc rút các luận điểm cốt lõi' },
    { id: 'p4', stepName: 'Lập dàn ý', minutes: 10, note: 'Xây dựng khung bài viết gồm' },
    { id: 'p5', stepName: 'Viết essay', minutes: 45, note: 'Tập trung viết mạch lạc, liên' },
    { id: 'p6', stepName: 'Đọc lại bài, chỉnh sửa, kiểm tra lỗi và hoàn thiện', minutes: 10, note: 'Chỉnh sửa lỗi chính tả, câu chữ' },
    { id: 'p7', stepName: 'Tổng hợp lại các tài liệu tham khảo (Trình bày)', minutes: 5, note: 'Liệt kê danh mục tài liệu tham' },
  ]);

  const totalMinutes = processSteps.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const totalHoursStr = Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)} tiếng ` : '';
  const totalMinsStr = totalMinutes % 60 > 0 ? `${totalMinutes % 60} phút` : '';

  const handleGenerateOutline = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setOutline([
        { id: 'o1', text: 'Mở bài: Dẫn dắt vấn đề về sự bùng nổ của kỷ nguyên số và nêu nhận định chung về tầm quan trọng của ý thức tự học' },
        { id: 'o2', text: 'Thân bài - Giải thích khái niệm: Thế nào là tự học và kỷ luật bản thân trong môi trường số (khả năng tự định hướng, tự học)' },
        { id: 'o3', text: 'Thân bài - Phân tích thực trạng: Chỉ ra những cơ hội học tập mở rộng cùng những thách thức lớn như sự xao nhãng' },
        { id: 'o4', text: 'Thân bài - Vai trò và ý nghĩa: Kỷ luật và tự học giúp học sinh tiếp thu tri thức chủ động, phát triển tư duy độc lập' },
        { id: 'o5', text: 'Thân bài - Dẫn chứng và Phản đề: Đưa ra các ví dụ thực tế về những tấm gương tự học thành công nhờ công nghệ' },
        { id: 'o6', text: 'Thân bài - Giải pháp hành động: Đề xuất các phương pháp rèn luyện cụ thể (quản lý thời gian bằng ứng dụng Pomodoro)' },
        { id: 'o7', text: 'Kết bài: Khẳng định lại ý nghĩa của tự học và kỷ luật trong việc định hình tương lai cá nhân; rút ra bài học nhận thức' },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const addOutline = () => {
    if (!newOutlineText.trim()) return;
    setOutline([...outline, { id: Math.random().toString(), text: newOutlineText }]);
    setNewOutlineText('');
  };

  const addProcessStep = () => {
    setProcessSteps([...processSteps, { id: Math.random().toString(), stepName: '', minutes: 0, note: '' }]);
  };

  const updateProcessStep = (id: string, field: keyof ProcessStep, value: string | number) => {
    setProcessSteps(processSteps.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  return (
    <div className="space-y-6">
      
      {/* Outline Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FileText className="w-3.5 h-3.5" />
              </div>
              Khung Dàn Ý Gợi Ý (Outline)
            </h2>
            <p className="text-slate-500 text-sm mt-1">Các mốc định hướng bố cục giúp học sinh triển khai bài luận tuần tự.</p>
          </div>
          <button 
            onClick={handleGenerateOutline}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Đang tạo...' : 'Tạo Outline bằng AI'}
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {outline.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold text-sm w-6">#{idx + 1}</span>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm">
                {item.text}
              </div>
              <button 
                onClick={() => setOutline(outline.filter(o => o.id !== item.id))}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {outline.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
              Chưa có dàn ý. Hãy bấm &quot;Tạo Outline bằng AI&quot; hoặc thêm thủ công.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Ví dụ: Mở bài - Nêu luận điểm chính định hướng..." 
            value={newOutlineText}
            onChange={(e) => setNewOutlineText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOutline()}
            className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button 
            onClick={addOutline}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mục
          </button>
        </div>
      </div>


      {/* Process Allocation Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              Phân Bổ Tiến Trình Viết Essay (Chia Nhiều Ngày)
            </h2>
            <p className="text-slate-500 text-sm mt-1">Định hình các bước tự học, thời gian hoàn thành lý tưởng và lưu ý (LU) giúp học sinh làm bài độc lập.</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl flex items-center gap-3 whitespace-nowrap">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div className="text-sm text-slate-600">
              Tổng thời gian dự kiến: <strong className="text-indigo-700 text-base ml-1">{totalHoursStr}{totalMinsStr}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          <div className="w-8 text-center">STT</div>
          <div>CÁC BƯỚC THỰC HIỆN (HỌC SINH)</div>
          <div className="w-40 text-center">ƯỚC LƯỢNG THỜI GIAN PHÙ HỢP</div>
          <div>LƯU Ý / HƯỚNG DẪN KÈM THEO (LU)</div>
          <div className="w-12 text-center">XÓA</div>
        </div>

        <div className="space-y-3 mb-6">
          {processSteps.map((step, idx) => (
            <div key={step.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 transition-colors">
              <div className="w-8 text-center text-slate-500 font-bold">{idx + 1}</div>
              
              <input 
                type="text" 
                value={step.stepName}
                onChange={(e) => updateProcessStep(step.id, 'stepName', e.target.value)}
                placeholder="Nhập bước..."
                className="bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm w-full"
              />
              
              <div className="w-40 flex items-center justify-center gap-2">
                <input 
                  type="number" 
                  min="0"
                  value={step.minutes}
                  onChange={(e) => updateProcessStep(step.id, 'minutes', parseInt(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-200 text-center text-slate-900 rounded-lg py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-slate-500 text-xs">phút</span>
              </div>
              
              <input 
                type="text" 
                value={step.note}
                onChange={(e) => updateProcessStep(step.id, 'note', e.target.value)}
                placeholder="Lưu ý..."
                className="bg-transparent border-none focus:outline-none text-slate-600 placeholder:text-slate-400 text-sm w-full italic"
              />
              
              <div className="w-12 flex justify-center">
                <button 
                  onClick={() => setProcessSteps(processSteps.filter(s => s.id !== step.id))}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <button 
            onClick={addProcessStep}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Bước Lập Kế Hoạch
          </button>
          
          <div className="text-xs text-slate-500 italic">
            * Đề xuất tự động tính dựa trên dữ liệu ảnh: <strong>Tổng {totalMinutes} phút (~{Math.round(totalMinutes/60)} tiếng)</strong> chia nhiều ngày làm việc.
          </div>
        </div>
      </div>

    </div>
  );
}

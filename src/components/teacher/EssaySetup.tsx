'use client';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Clock, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  BookOpen, 
  HelpCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import clsx from 'clsx';

import { TaskType } from '@/lib/engine/types';
import {
  getTaskTypeLabel,
  getTemplateSteps,
  GROUP_MEETING_MINUTES,
  GROUP_REHEARSAL_MINUTES,
} from '@/lib/engine/task-templates';

export interface ProcessStepItem {
  id: string;
  stepName: string;
  minutes: number;
  note: string;
}

export interface OutlineItem {
  id: string;
  text: string;
}

interface EssaySetupProps {
  title?: string;
  topic?: string;
  subjectId?: string;
  classId?: string;
  taskType?: TaskType;
  isGroup?: boolean;
  /**
   * Tăng lên mỗi lần giáo viên bấm xác nhận đề bài ở modal prompt.
   * AI chỉ chạy khi đã có prompt chi tiết, tránh sinh ra các bước chung chung.
   */
  promptVersion?: number;
  onStepsChange?: (steps: ProcessStepItem[]) => void;
  onOutlineChange?: (outline: OutlineItem[], isApproved: boolean) => void;
}

// Auto-fitting Textarea Component with zero scrollbars and no line clipping
const AutoResizingTextarea = ({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      // Đặt height về 1px để ép trình duyệt tính toán lại scrollHeight chính xác theo width thực tế
      textareaRef.current.style.height = '1px';
      const exactHeight = textareaRef.current.scrollHeight + 2;
      textareaRef.current.style.height = `${Math.max(40, exactHeight)}px`;
    }
  };

  React.useLayoutEffect(() => {
    adjustHeight();
    const timer = setTimeout(adjustHeight, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      rows={1}
      className={clsx("overflow-hidden resize-none transition-all leading-relaxed whitespace-normal break-words focus:ring-2 focus:outline-none", className)}
    />
  );
};

const detectLanguageFromSubject = (sub: string = ''): 'english' | 'vietnamese' => {
  const s = sub.toLowerCase();
  if (
    s.includes('anh') || 
    s.includes('english') || 
    s.includes('trung') || 
    s.includes('pháp') || 
    s.includes('nhật') || 
    s.includes('hàn') ||
    s.includes('ngoại ngữ')
  ) {
    return 'english';
  }
  return 'vietnamese';
};

/**
 * Bỏ phần "(10 phút)" AI hay chèn vào tên bước.
 * Số phút đã có ô riêng bên cạnh, để cả hai nơi thì giáo viên phải sửa hai lần.
 */
const stripMinutesFromName = (name: string): string =>
  (name || '')
    .replace(/[\(\[]\s*(khoảng\s*|~\s*)?\d+\s*(-\s*\d+\s*)?(phút|phut|p|min|mins|minutes)\s*[\)\]]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([:.,;])/g, '$1')
    .trim();

/**
 * Bước mặc định lấy từ bộ mẫu dùng chung của engine, nên mọi dạng bài
 * (kể cả sơ đồ tư duy và thuyết trình) đều có tiến trình đúng khi AI chưa chạy hoặc lỗi.
 */
const getInitialSteps = (type?: TaskType, isGroup = false): ProcessStepItem[] =>
  getTemplateSteps(type ?? 'essay', isGroup).map((s, i) => ({
    id: `p${i + 1}`,
    stepName: `Bước ${i + 1}: ${s.name}`,
    minutes: s.min,
    note: '',
  }));

/**
 * Bài nhóm luôn phải có phần điều phối: họp phân công đầu tiên và tập duyệt cuối cùng.
 * AI có thể quên hai bước này nên bổ sung lại nếu thiếu.
 */
const withGroupCoordination = (steps: ProcessStepItem[], isGroup: boolean): ProcessStepItem[] => {
  if (!isGroup) return steps;

  const hasMeeting = steps.some(s => /họp nhóm|phân công/i.test(s.stepName));
  const hasRehearsal = steps.some(s => /tập duyệt|tổng duyệt/i.test(s.stepName));

  return [
    ...(hasMeeting ? [] : [{
      id: 'group-meeting',
      stepName: 'Họp nhóm phân chia công việc và rà soát',
      minutes: GROUP_MEETING_MINUTES,
      note: 'Thống nhất nội dung, phân vai và mốc thời gian',
    }]),
    ...steps,
    ...(hasRehearsal ? [] : [{
      id: 'group-rehearsal',
      stepName: 'Tập duyệt trình bày sản phẩm cùng nhóm',
      minutes: GROUP_REHEARSAL_MINUTES,
      note: 'Ghép phần các thành viên, xử lý chuyển tiếp',
    }]),
  ];
};

const getInitialOutline = (type?: TaskType): OutlineItem[] => {
  if (type === 'mindmap_short' || type === 'mindmap_long') {
    return [
      { id: 'o1', text: '1. Chủ đề trung tâm của sơ đồ' },
      { id: 'o2', text: '2. Các nhánh chính (mỗi nhánh là một đơn vị kiến thức lớn)' },
      { id: 'o3', text: '3. Nhánh phụ và từ khoá cho từng nhánh chính' },
      { id: 'o4', text: '4. Ví dụ hoặc công thức minh hoạ gắn với từng nhánh' },
      ...(type === 'mindmap_long'
        ? [{ id: 'o5', text: '5. Liên kết ngang giữa các nhánh, chỉ ra mối quan hệ kiến thức' }]
        : []),
    ];
  }
  if (type === 'presentation_individual' || type === 'presentation_group') {
    return [
      { id: 'o1', text: '1. Mở đầu: Giới thiệu chủ đề và thông điệp chính' },
      { id: 'o2', text: '2. Bối cảnh và lý do chủ đề này đáng quan tâm' },
      { id: 'o3', text: '3. Nội dung trọng tâm 1 kèm dẫn chứng cụ thể' },
      { id: 'o4', text: '4. Nội dung trọng tâm 2 kèm số liệu hoặc ví dụ' },
      { id: 'o5', text: '5. Liên hệ thực tế với bản thân và lớp học' },
      { id: 'o6', text: '6. Kết luận và câu hỏi thảo luận cho người nghe' },
      ...(type === 'presentation_group'
        ? [{ id: 'o7', text: '7. Bảng phân công: ai trình bày phần nào, thời lượng bao lâu' }]
        : []),
    ];
  }
  if (type === 'chart') {
    return [
      { id: 'o1', text: '1. Tên biểu đồ & Tóm tắt mục tiêu thể hiện số liệu' },
      { id: 'o2', text: '2. Bảng số liệu đã xử lý & đơn vị tính chính xác' },
      { id: 'o3', text: '3. Dạng biểu đồ lựa chọn (Cột, Đường, Tròn, Kết hợp...) & Lý do lựa chọn' },
      { id: 'o4', text: '4. Nhận xét tổng quan: Đánh giá xu hướng chung, nhận xét khái quát' },
      { id: 'o5', text: '5. Nhận xét chi tiết: So sánh các mốc thời gian, đối tượng, giá trị cao/thấp nhất' },
      { id: 'o6', text: '6. Giải thích nguyên nhân & Rút ra kết luận/dự báo' }
    ];
  }
  if (type === 'project') {
    return [
      { id: 'o1', text: '1. Mục tiêu & Phạm vi thực hiện dự án' },
      { id: 'o2', text: '2. Kế hoạch phân công công việc & Tiến độ chi tiết' },
      { id: 'o3', text: '3. Nội dung thu thập & Kết quả nghiên cứu thực tế' },
      { id: 'o4', text: '4. Tổng kết sản phẩm, bài học kinh nghiệm & Đánh giá kết quả' }
    ];
  }
  return [
    { id: 'o1', text: 'Mở bài: Dẫn dắt vấn đề và nêu nhận định chung về tầm quan trọng của ý thức tự học trong kỷ nguyên số.' },
    { id: 'o2', text: 'Thân bài - Giải thích khái niệm: Thế nào là tự học và kỷ luật bản thân trong môi trường học tập hiện đại.' },
    { id: 'o3', text: 'Thân bài - Phân tích thực trạng: Chỉ ra những cơ hội học tập mở rộng cùng những thách thức lớn như sự xao nhãng.' },
    { id: 'o4', text: 'Thân bài - Vai trò và ý nghĩa: Kỷ luật và tự học giúp học sinh tiếp thu tri thức chủ động, phát triển tư duy độc lập.' },
    { id: 'o5', text: 'Thân bài - Dẫn chứng & Phản đề: Đưa ra các ví dụ thực tế về gương tự học thành công và bài học vượt qua xao nhãng.' },
    { id: 'o6', text: 'Thân bài - Giải pháp hành động: Đề xuất các phương pháp rèn luyện cụ thể (quản lý thời gian Pomodoro, lập checklist).' },
    { id: 'o7', text: 'Kết bài: Khẳng định lại ý nghĩa của tự học và kỷ luật trong việc định hình tương lai cá nhân; rút ra bài học nhận thức.' },
  ];
};

export default function EssaySetup({
  title = '',
  topic = '',
  subjectId = 'Ngữ văn',
  classId = '10A',
  taskType = 'essay',
  isGroup = false,
  promptVersion = 0,
  onStepsChange,
  onOutlineChange
}: EssaySetupProps) {
  // Language & Analyzing State (Automatically detected from teacher subject)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    detectLanguageFromSubject(subjectId)
  );

  // Sync language automatically when teacher changes subjectId
  useEffect(() => {
    setSelectedLanguage(detectLanguageFromSubject(subjectId));
  }, [subjectId]);

  const [hasGeneratedOnce, setHasGeneratedOnce] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [languageNotes, setLanguageNotes] = useState<string>('');

  // Process Steps State
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>(() => getInitialSteps(taskType, isGroup));

  // Outline State
  const [outline, setOutline] = useState<OutlineItem[]>(() => getInitialOutline(taskType));

  // Update initial steps & outline when taskType changes
  useEffect(() => {
    setProcessSteps(getInitialSteps(taskType, isGroup));
    setOutline(getInitialOutline(taskType));
    setHasGeneratedOnce(false);
  }, [taskType, isGroup]);
  const [newOutlineText, setNewOutlineText] = useState('');
  const [isOutlineApproved, setIsOutlineApproved] = useState<boolean>(true);

  // Sync back to parent
  useEffect(() => {
    onStepsChange?.(processSteps);
  }, [processSteps]);

  useEffect(() => {
    onOutlineChange?.(outline, isOutlineApproved);
  }, [outline, isOutlineApproved]);

  // Tổng thời gian khung chuẩn của dạng bài hiện tại, hiển thị trên nút đặt lại
  const standardTotalMinutes = getTemplateSteps(taskType, isGroup).reduce((sum, s) => sum + s.min, 0);

  const totalMinutes = processSteps.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const totalTimeString = totalHours > 0 
    ? `${totalHours} tiếng ${remainingMins > 0 ? remainingMins + ' phút' : ''}` 
    : `${totalMinutes} phút`;

  // Gemini AI Analysis Trigger
  const handleAnalyzeWithGemini = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/generate-essay-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Viết essay rèn luyện tự học',
          topic,
          subject: subjectId,
          classId,
          taskType,
          language: selectedLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.steps && data.steps.length > 0) {
          const cleanedSteps = data.steps.map((s: ProcessStepItem) => ({
            ...s,
            stepName: stripMinutesFromName(s.stepName),
          }));
          setProcessSteps(withGroupCoordination(cleanedSteps, isGroup));
        }
        if (data.outline && data.outline.length > 0) setOutline(data.outline);
        if (data.languageNotes) setLanguageNotes(data.languageNotes);
      }
    } catch (e) {
      console.error('Error analyzing with Gemini AI:', e);
    } finally {
      setIsAnalyzing(false);
      setHasGeneratedOnce(true);
    }
  };

  // Chỉ gọi AI sau khi giáo viên đã xác nhận đề bài + prompt chi tiết,
  // nhờ vậy các bước sinh ra bám sát nội dung thay vì chung chung.
  useEffect(() => {
    if (promptVersion > 0 && title && title.trim()) {
      handleAnalyzeWithGemini();
    }
  }, [promptVersion]);

  const addProcessStep = () => {
    setProcessSteps([
      ...processSteps, 
      { id: Math.random().toString(), stepName: '', minutes: 15, note: '' }
    ]);
  };

  const updateProcessStep = (id: string, field: keyof ProcessStepItem, value: string | number) => {
    setProcessSteps(processSteps.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  const removeProcessStep = (id: string) => {
    setProcessSteps(processSteps.filter(s => s.id !== id));
  };

  const addOutlineItem = () => {
    if (!newOutlineText.trim()) return;
    setOutline([...outline, { id: Math.random().toString(), text: newOutlineText.trim() }]);
    setNewOutlineText('');
  };

  const updateOutlineItem = (id: string, text: string) => {
    setOutline(outline.map(o => o.id === id ? { ...o, text } : o));
  };

  const removeOutlineItem = (id: string) => {
    setOutline(outline.filter(o => o.id !== id));
  };

  // Đặt lại về khung chuẩn của đúng dạng bài đang chọn, không phải khung essay cố định
  const resetToStandardSteps = () => {
    setProcessSteps(getInitialSteps(taskType, isGroup));
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {isAnalyzing ? (
        <div className="bg-white rounded-3xl p-8 border border-blue-200/90 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200/80 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Trợ Lý AI Đang Phân Tích Đề Bài & Lập Kế Hoạch...
            </div>
            <h3 className="text-base font-black text-slate-900">
              Tự Động Sinh Thời Gian & Khung Dàn Ý Chi Tiết
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Đang đọc đề bài <strong className="text-blue-900">"{title || 'Bài tập essay'}"</strong>, tính toán số phút phù hợp cho từng bước và sinh khung dàn ý...
            </p>
          </div>

          {/* Skeleton Loaders */}
          <div className="space-y-3 max-w-xl mx-auto pt-2">
            <div className="h-12 bg-slate-100/90 rounded-2xl animate-pulse flex items-center px-4 justify-between">
              <div className="w-48 h-4 bg-slate-200 rounded-lg" />
              <div className="w-16 h-4 bg-blue-200 rounded-lg" />
            </div>
            <div className="h-12 bg-slate-100/90 rounded-2xl animate-pulse flex items-center px-4 justify-between opacity-80">
              <div className="w-56 h-4 bg-slate-200 rounded-lg" />
              <div className="w-16 h-4 bg-blue-200 rounded-lg" />
            </div>
            <div className="h-12 bg-slate-100/90 rounded-2xl animate-pulse flex items-center px-4 justify-between opacity-60">
              <div className="w-40 h-4 bg-slate-200 rounded-lg" />
              <div className="w-16 h-4 bg-blue-200 rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Foreign language note banner */}
          {selectedLanguage === 'english' && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs font-semibold">
              <Globe className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-amber-950">Lưu ý phân bổ môn Ngoại Ngữ:</strong>
                <p className="mt-0.5 text-amber-800">
                  Đối với bài viết Tiếng Anh/Ngoại ngữ, thời gian thực hiện được tự động điều chỉnh tăng (~30%) để hỗ trợ học sinh tra cứu từ vựng chuyên ngành, rà soát cấu trúc ngữ pháp (grammar) và liên kết mạch đoạn (Coherence & Cohesion).
                </p>
              </div>
            </div>
          )}

          {/* 1. Process Allocation Section */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                <Clock className="w-4 h-4" />
              </div>
              Phân Bổ Tiến Trình: {getTaskTypeLabel(taskType as TaskType)}
            </h3>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Định hình các bước thực hiện, thời gian hoàn thành lý tưởng và lưu ý giúp học sinh làm bài độc lập không lo tràn LU.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleAnalyzeWithGemini}
              disabled={isAnalyzing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-950" />}
              {isAnalyzing ? 'Đang tạo...' : '✨ Generate Lại Bằng AI'}
            </button>

            <button
              type="button"
              onClick={resetToStandardSteps}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title={`Đặt lại về khung thời gian chuẩn ${standardTotalMinutes} phút của dạng bài này`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Khung {standardTotalMinutes}p Chuẩn
            </button>

            <div className="bg-indigo-50/80 border border-indigo-100 px-4 py-2 rounded-2xl flex items-center gap-2.5 whitespace-nowrap shadow-sm">
              <Clock className="w-4 h-4 text-indigo-600" />
              <div className="text-xs text-slate-600 font-bold">
                Tổng thời gian dự kiến: <strong className="text-indigo-700 text-sm font-black ml-1">{totalTimeString}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-[3rem_1fr_10rem_1fr_3rem] gap-3 px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            <div className="text-center">STT</div>
            <div>CÁC BƯỚC THỰC HIỆN (HỌC SINH)</div>
            <div className="text-center">ƯỚC LƯỢNG THỜI GIAN</div>
            <div>LƯU Ý / HƯỚNG DẪN KÈM THEO (LU)</div>
            <div className="text-center">XÓA</div>
          </div>

          <div className="space-y-2.5">
            {processSteps.map((step, idx) => (
              <div 
                key={step.id} 
                className="flex flex-col sm:grid sm:grid-cols-[3rem_1fr_10rem_1fr_3rem] gap-2 sm:gap-3 items-start bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl p-3 transition-colors"
              >
                <div className="w-7 h-7 mt-0.5 sm:mt-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                
                <AutoResizingTextarea 
                  value={step.stepName}
                  onChange={(val) => updateProcessStep(step.id, 'stepName', val)}
                  placeholder="Nhập tên bước..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:ring-blue-500 placeholder:text-slate-400"
                />
                
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 mt-0 sm:mt-1">
                  <input 
                    type="number" 
                    min="5"
                    step="5"
                    value={step.minutes}
                    onChange={(e) => updateProcessStep(step.id, 'minutes', parseInt(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-20 bg-white border border-slate-200 text-center font-black text-blue-600 rounded-xl py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-slate-500 text-xs font-bold">phút</span>
                </div>
                
                <AutoResizingTextarea 
                  value={step.note}
                  onChange={(val) => updateProcessStep(step.id, 'note', val)}
                  placeholder="Lưu ý hướng dẫn..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 italic focus:ring-blue-500 placeholder:text-slate-400"
                />
                
                <div className="flex justify-end sm:justify-center w-full sm:w-auto mt-0 sm:mt-1">
                  <button 
                    type="button"
                    onClick={() => removeProcessStep(step.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="button"
          onClick={addProcessStep}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Bước Lập Kế Hoạch
        </button>
      </div>

      {/* 2. Outline Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
                <FileText className="w-4 h-4" />
              </div>
              Khung Dàn Ý Gợi Ý (Outline)
            </h3>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Các mốc định hướng bố cục giúp học sinh triển khai bài luận tuần tự & mạch lạc.
            </p>
          </div>

          {/* Teacher Approval Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOutlineApproved(true)}
              className={clsx(
                "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm",
                isOutlineApproved 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <CheckCircle2 className="w-4 h-4" /> Duyệt / Thông Qua Outline
            </button>

            <button
              type="button"
              onClick={() => setIsOutlineApproved(false)}
              className={clsx(
                "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm",
                !isOutlineApproved 
                  ? "bg-slate-700 text-white border-slate-700" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <XCircle className="w-4 h-4" /> Không Thông Qua
            </button>
          </div>
        </div>

        {/* Outline approval status badge */}
        <div className={clsx(
          "p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all",
          isOutlineApproved 
            ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
            : "bg-slate-100 border-slate-200 text-slate-600"
        )}>
          {isOutlineApproved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Đã duyệt:</strong> Khung dàn ý hướng dẫn này sẽ được hiển thị chi tiết trên <strong>Workmap & Task của Học Sinh</strong> để chỉ dẫn viết essay.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                <strong>Chưa duyệt:</strong> Học sinh sẽ chỉ nhận lịch giao các bước làm bài trên Workmap mà không xem khung dàn ý chi tiết.
              </span>
            </>
          )}
        </div>

        {/* List of Outline Items */}
        <div className="space-y-3">
          {outline.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-3 bg-slate-50/80 hover:bg-slate-100/60 p-2.5 rounded-2xl border border-slate-200/90 transition-all">
              <span className="text-indigo-600 font-black text-xs w-8 shrink-0 text-center bg-indigo-50 border border-indigo-100 py-1.5 rounded-xl mt-0.5 shadow-sm">
                #{idx + 1}
              </span>
              <AutoResizingTextarea
                value={item.text}
                onChange={(val) => updateOutlineItem(item.id, val)}
                className="flex-1 bg-white border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-extrabold text-slate-900 focus:ring-indigo-500"
              />
              <button 
                type="button"
                onClick={() => removeOutlineItem(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {outline.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
              Chưa có dàn ý. Bấm "Phân Tích Bằng AI" để tự động sinh khung dàn ý.
            </div>
          )}
        </div>

        {/* Add manual outline row */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            placeholder="Ví dụ: Mở bài - Dẫn dắt vấn đề và phát biểu luận điểm..." 
            value={newOutlineText}
            onChange={(e) => setNewOutlineText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutlineItem())}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
          <button 
            type="button"
            onClick={addOutlineItem}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Mục Dàn Ý
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

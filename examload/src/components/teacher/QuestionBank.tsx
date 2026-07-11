import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

interface Question {
  id: string;
  difficulty: Difficulty;
  timeSeconds: number;
  text: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    difficulty: 'easy',
    timeSeconds: 20,
    text: 'Cho phương trình bậc hai: x² - 5x + 6 = 0. Biệt thức Δ (Delta) của phương trình này có giá trị bằng bao nhiêu?',
    options: [
      { label: 'A', text: 'Δ = 1', isCorrect: true },
      { label: 'B', text: 'Δ = 25', isCorrect: false },
      { label: 'C', text: 'Δ = -1', isCorrect: false },
      { label: 'D', text: 'Δ = 0', isCorrect: false },
    ],
    explanation: 'Biệt thức Δ = b² - 4ac = (-5)² - 4*1*6 = 25 - 24 = 1. Vì Δ > 0 nên phương trình có hai nghiệm phân biệt.'
  },
  {
    id: 'q2',
    difficulty: 'medium',
    timeSeconds: 45,
    text: 'Định lý Vi-ét phát biểu về mối liên hệ giữa các nghiệm x₁, x₂ của phương trình bậc hai ax² + bx + c = 0 (a ≠ 0). Tổng (S) và Tích (P) của các nghiệm này là gì?',
    options: [
      { label: 'A', text: 'S = -b/a, P = c/a', isCorrect: true },
      { label: 'B', text: 'S = b/a, P = -c/a', isCorrect: false },
      { label: 'C', text: 'S = -c/a, P = b/a', isCorrect: false },
      { label: 'D', text: 'S = -b/2a, P = c/2a', isCorrect: false },
    ],
    explanation: 'Theo định lý Vi-ét, tổng hai nghiệm là S = -b/a và tích hai nghiệm là P = c/a.'
  },
  {
    id: 'q3',
    difficulty: 'hard',
    timeSeconds: 120,
    text: 'Tìm tất cả các giá trị của tham số m để phương trình x² - 2(m-1)x + m² - 3 = 0 có hai nghiệm phân biệt x₁, x₂ thỏa mãn x₁² + x₂² = 4.',
    options: [
      { label: 'A', text: 'm = 1', isCorrect: false },
      { label: 'B', text: 'm = -1', isCorrect: false },
      { label: 'C', text: 'm = 1 hoặc m = -1', isCorrect: true },
      { label: 'D', text: 'Không có giá trị nào của m', isCorrect: false },
    ],
    explanation: 'Sử dụng hệ thức Vi-ét và điều kiện Δ > 0. Ta có Δ\' = (m-1)² - (m²-3) = -2m + 4 > 0 => m < 2. Và x₁² + x₂² = S² - 2P = 4 => (2(m-1))² - 2(m²-3) = 4 <=> 2m² - 8m + 6 = 0 <=> m = 1 (TM) hoặc m = 3 (Loại).' // Modified to single correct for simplicity
  }
];

const difficultyMap = {
  easy: { title: 'Nhận biết', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  medium: { title: 'Thông hiểu', color: 'text-blue-700', bg: 'bg-blue-100' },
  hard: { title: 'Vận dụng', color: 'text-orange-700', bg: 'bg-orange-100' },
  very_hard: { title: 'Vận dụng cao', color: 'text-red-700', bg: 'bg-red-100' },
};

type FilterTab = 'all' | Difficulty;

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [questions] = useState<Question[]>(mockQuestions);

  const filteredQuestions = activeTab === 'all' 
    ? questions 
    : questions.filter(q => q.difficulty === activeTab);

  const counts = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
    very_hard: questions.filter(q => q.difficulty === 'very_hard').length,
  };

  const tabs = [
    { id: 'all', label: `Tất cả (${counts.all})` },
    { id: 'easy', label: `Nhận biết (${counts.easy})` },
    { id: 'medium', label: `Thông hiểu (${counts.medium})` },
    { id: 'hard', label: `Vận dụng (${counts.hard})` },
    { id: 'very_hard', label: `Vận dụng cao (${counts.very_hard})` },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-emerald-600 text-2xl leading-none">+</span> Ngân Hàng Câu Hỏi Đề Thi
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Tổng số câu hỏi hiện có: <strong className="text-slate-900">{counts.all} câu</strong>. Xem, sửa đổi hoặc thêm câu hỏi mới.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm Câu Hỏi Thủ Công
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-xl mb-6 border border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border border-transparent",
              activeTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm border-slate-200" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, index) => {
          const diffMeta = difficultyMap[q.difficulty];
          return (
            <div key={q.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold text-sm">#{index + 1}</span>
                  <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-lg", diffMeta.bg, diffMeta.color)}>
                    {diffMeta.title}
                  </span>
                  <span className="text-xs text-slate-500">Thời gian: {q.timeSeconds} giây</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-slate-900 text-[15px] leading-relaxed font-medium mb-5">
                {q.text}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {q.options.map((opt, optIdx) => (
                  <div 
                    key={optIdx} 
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl border",
                      opt.isCorrect 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      opt.isCorrect 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-200 text-slate-700"
                    )}>
                      {opt.label}
                    </div>
                    <div className={clsx(
                      "text-sm flex-1",
                      opt.isCorrect ? "text-emerald-700 font-medium" : "text-slate-700"
                    )}>
                      {opt.text}
                    </div>
                    {opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Giải thích đáp án đúng:
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  {q.explanation}
                </div>
              </div>
            </div>
          );
        })}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Không có câu hỏi nào thuộc mức độ này.
          </div>
        )}
      </div>
    </div>
  );
}

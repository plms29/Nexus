'use client';

import { useTranslate } from '@/lib/i18n';
import { useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import clsx from 'clsx';

type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

interface RowData {
  id: Difficulty;
  title: string;
  level: string;
  desc: string;
  questions: number;
  timePerQuestion: number;
  color: string;
  bg: string;
}

const initialData: RowData[] = [
  { id: 'easy', title: 'Nhận biết', level: 'Dễ', desc: 'Kiểm tra trí nhớ, định nghĩa, nhận diện trực tiếp', questions: 10, timePerQuestion: 20, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { id: 'medium', title: 'Thông hiểu', level: 'Trung bình', desc: 'Giải thích bản chất, so sánh, chứng minh đơn giản', questions: 5, timePerQuestion: 45, color: 'text-blue-700', bg: 'bg-blue-100' },
  { id: 'hard', title: 'Vận dụng', level: 'Khó', desc: 'Giải quyết bài toán qua 2-3 bước suy luận, tính toán', questions: 3, timePerQuestion: 120, color: 'text-orange-700', bg: 'bg-orange-100' },
  { id: 'very_hard', title: 'Vận dụng cao', level: 'Rất khó', desc: 'Tích hợp kiến thức sâu, giải quyết tình huống thực tế phức tạp', questions: 2, timePerQuestion: 180, color: 'text-red-700', bg: 'bg-red-100' },
];

const timeOptions = [
  { label: '20 giây', value: 20 },
  { label: '30 giây', value: 30 },
  { label: '45 giây', value: 45 },
  { label: '60 giây', value: 60 },
  { label: '90 giây', value: 90 },
  { label: '2 phút', value: 120 },
  { label: '3 phút', value: 180 },
  { label: '5 phút', value: 300 },
];

function formatTime(seconds: number, tr: (text: string) => string) {
  const sec = tr('giây');
  const min = tr('phút');
  if (seconds === 0) return `0 ${sec}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} ${sec}`;
  if (s === 0) return `${m} ${min}`;
  return `${m} ${min} ${s} ${sec}`;
}

export default function QuizSetup() {
  const tr = useTranslate();
  const [data, setData] = useState<RowData[]>(initialData);

  const updateQuestions = (id: Difficulty, val: number) => {
    setData(data.map(d => d.id === id ? { ...d, questions: val >= 0 ? val : 0 } : d));
  };

  const updateTime = (id: Difficulty, val: number) => {
    setData(data.map(d => d.id === id ? { ...d, timePerQuestion: val } : d));
  };

  const totalQuestions = data.reduce((acc, curr) => acc + curr.questions, 0);
  const totalTimeSeconds = data.reduce((acc, curr) => acc + (curr.questions * curr.timePerQuestion), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-400" />
      
      <div className="p-6 border-b border-slate-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">{tr("Phân Bổ Cấu Trúc Đề & Thời Gian")}</h2>
          </div>
          <p className="text-slate-500 text-sm">{tr("Thiết lập tỷ lệ câu hỏi và cấu hình thời gian làm bài tối đa cho từng cấp độ.")}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2 max-w-xs">
          <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
          <span>{tr("Hệ thống tự động tính:")} <strong>{tr("Tổng thời gian = Số câu × Thời gian/câu")}</strong></span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div>{tr("Độ Khó")}</div>
          <div className="text-center">{tr("Số Lượng Câu Hỏi")}</div>
          <div className="text-center">{tr("Thời Gian / Câu")}</div>
          <div className="text-right">{tr("Tổng Thời Gian")}</div>
        </div>

        <div className="space-y-3">
          {data.map((row) => {
            const rowTotalSeconds = row.questions * row.timePerQuestion;
            return (
              <div key={row.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", row.bg, row.color)}>
                      {tr(row.title)} ({tr(row.level)})
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs pr-4">{tr(row.desc)}</p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <input 
                    type="number" 
                    min="0"
                    value={row.questions}
                    onChange={(e) => updateQuestions(row.id, parseInt(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-200 text-center text-slate-900 rounded-lg py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 text-xs">{tr("câu")}</span>
                </div>

                <div className="flex justify-center">
                  <select 
                    value={row.timePerQuestion}
                    onChange={(e) => updateTime(row.id, parseInt(e.target.value))}
                    className="bg-white border border-slate-200 text-slate-900 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                  >
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{tr(opt.label)}</option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatTime(rowTotalSeconds, tr)}</div>
                  <div className="text-[10px] text-slate-500">({row.questions} × {row.timePerQuestion}s)</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center">
          <div className="font-bold text-blue-700 text-lg">{tr("Tổng Cộng Đề Thi")}</div>
          <div className="text-center font-bold text-slate-900 text-lg">{totalQuestions} <span className="text-sm font-normal text-slate-500">{tr("câu")}</span></div>
          <div className="text-center text-slate-500 text-xs italic">{tr("Thời gian tùy chỉnh từng câu")}</div>
          <div className="text-right">
            <div className="font-bold text-emerald-600 text-xl">{formatTime(totalTimeSeconds, tr)}</div>
            <div className="text-[10px] text-slate-500">(~{Math.round(totalTimeSeconds/60)} {tr("phút)")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

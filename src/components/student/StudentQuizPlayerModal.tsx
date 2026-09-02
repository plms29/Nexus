'use client';

import { useTranslate } from '@/lib/i18n';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useStore, QuizResult } from '@/store/useStore';
import { Task } from '@/lib/engine/types';
import { fetchQuestionsForTask, QuestionItem as DbQuestionItem } from '@/lib/api';

interface QuestionItem {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  level?: string;
  image_url?: string | null;
}

interface StudentQuizPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const StudentQuizPlayerModal: React.FC<StudentQuizPlayerModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const tr = useTranslate();
  const { addQuizResult, quizResults } = useStore();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes default timer

  useEffect(() => {
    if (isOpen && task) {
      setLoading(true);
      setIsSubmitted(false);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(15 * 60);

      fetchQuestionsForTask(task.id).then((qData: DbQuestionItem[]) => {
        if (qData && qData.length > 0) {
          const mapped: QuestionItem[] = qData.map((q: DbQuestionItem) => ({
            id: q.id || crypto.randomUUID(),
            question_text: q.question_text,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            level: q.level,
            image_url: q.image_url
          }));
          setQuestions(mapped);
        } else {
          // Mock fallbacks if package hasn't synced yet
          setQuestions([
            {
              id: 'q1',
              question_text: 'Tư duy tự học đóng vai trò gì quan trọng nhất trong thời đại công nghệ số?',
              options: [
                'A. Giúp học sinh chủ động tìm kiếm kiến thức và rèn kỹ năng tự nghiên cứu',
                'B. Giảm bớt số lượng giáo viên giảng dạy trên lớp',
                'C. Giúp học sinh hoàn thành bài tập nhanh hơn mà không cần suy nghĩ',
                'D. Thay thế hoàn toàn các kỳ thi đánh giá học lực'
              ],
              correct_answer: 'A. Giúp học sinh chủ động tìm kiếm kiến thức và rèn kỹ năng tự nghiên cứu',
              explanation: 'Tự học là năng lực cốt lõi giúp người học chủ động cập nhật tri thức trong kỷ nguyên số.'
            },
            {
              id: 'q2',
              question_text: 'Phương pháp Pomodoro khuyên chúng ta nên tập trung trong bao lâu trước khi nghỉ giải lao?',
              options: [
                'A. 15 phút tập trung, nghỉ 10 phút',
                'B. 25 phút tập trung, nghỉ 5 phút',
                'C. 45 phút tập trung, nghỉ 15 phút',
                'D. 60 phút tập trung, nghỉ 20 phút'
              ],
              correct_answer: 'B. 25 phút tập trung, nghỉ 5 phút',
              explanation: 'Chu kỳ Pomodoro tiêu chuẩn là 25 phút làm việc tập trung cao độ kết hợp 5 phút nghỉ ngắn.'
            },
            {
              id: 'q3',
              question_text: 'Đâu là thói quen xấu ảnh hưởng tiêu cực nhất đến sự tập trung khi học tập?',
              options: [
                'A. Chuẩn bị không gian học thoáng mát',
                'B. Đặt mục tiêu học tập rõ ràng cho mỗi buổi học',
                'C. Để thông báo mạng xã hội liên tục bật bên cạnh',
                'D. Ghi chú bài học bằng sơ đồ tư duy'
              ],
              correct_answer: 'C. Để thông báo mạng xã hội liên tục bật bên cạnh',
              explanation: 'Thông báo điện thoại liên tục gây ngắt quãng luồng tư duy (Focus Flow).'
            }
          ]);
        }
        setLoading(false);
      });
    }
  }, [isOpen, task]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isSubmitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSubmitted, loading]);

  if (!isOpen || !task) return null;

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosen = answers[idx];
      if (chosen && chosen.trim() === q.correct_answer.trim()) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    const correctCount = calculateScore();
    const pct = Math.round((correctCount / (totalQ || 1)) * 100);
    
    const result: QuizResult = {
      taskId: task.id,
      score: correctCount,
      totalQuestions: totalQ,
      percentage: pct,
      completedAt: new Date().toLocaleDateString('vi-VN')
    };

    addQuizResult(result);
    setIsSubmitted(true);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Main Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                      {tr("Môn")} {tr(task.subject_id) || tr("Trắc nghiệm")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {tr("Lớp")} {task.class_id || '10A1'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                    {tr(task.title)}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer Badge */}
                {!isSubmitted && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-amber-300 font-mono font-black text-sm">
                    <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">{tr("Đang tải ngân hàng câu hỏi trắc nghiệm...")}</p>
              </div>
            ) : isSubmitted ? (
              /* RESULTS SCREEN */
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>

                  <div>
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">{tr("Kết Quả Bài Trắc Nghiệm")}</span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {calculateScore()} / {totalQ} {tr("CÂU ĐÚNG (")}{Math.round((calculateScore() / totalQ) * 100)}%)
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {tr("Đã Hoàn Thành & Tự Động Ghi Nhận Kết Quả Học Tập")}
                  </div>
                </div>

                {/* Question Review Section */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    {tr("Chi Tiết Đáp Án & Hướng Dẫn Giải:")}
                  </h4>

                  {questions.map((q, idx) => {
                    const chosen = answers[idx];
                    const isCorrect = chosen && chosen.trim() === q.correct_answer.trim();
                    return (
                      <div 
                        key={q.id}
                        className={clsx(
                          "bg-white rounded-2xl p-5 border shadow-2xs space-y-3",
                          isCorrect ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "w-6 h-6 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shrink-0",
                              isCorrect ? "bg-emerald-600" : "bg-rose-600"
                            )}>
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm">{tr(q.question_text)}</span>
                          </div>
                          <span className={clsx(
                            "text-xs font-black px-2.5 py-0.5 rounded-md shrink-0 border",
                            isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                          )}>
                            {isCorrect ? tr("✓ Đúng") : tr('✗ Sai')}
                          </span>
                        </div>

                        {q.image_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={q.image_url}
                            alt={tr("Ảnh minh họa đề bài")}
                            className="ml-8 max-h-48 w-auto rounded-xl border border-slate-200 object-contain"
                          />
                        )}

                        <div className="space-y-1.5 pl-8 text-xs font-semibold">
                          <div className="text-slate-700">
                            {tr("Lựa chọn của em:")} <strong className={isCorrect ? "text-emerald-700" : "text-rose-700"}>{tr(chosen) || tr("(Chưa chọn)")}</strong>
                          </div>
                          {!isCorrect && (
                            <div className="text-emerald-700 font-extrabold">
                              {tr("Đáp án chính xác:")} {tr(q.correct_answer)}
                            </div>
                          )}
                          {q.explanation && (
                            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] font-semibold mt-2 leading-relaxed">
                              💡 <strong>{tr("Giải thích chi tiết:")}</strong> {tr(q.explanation)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* QUIZ TESTING SCREEN */
              <div className="space-y-6">
                {/* Question Navigator Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                    <span>{tr("Danh Sách Câu Hỏi (")}{totalQ} {tr("câu):")}</span>
                    <span>{tr("Đã trả lời:")} {Object.keys(answers).length}/{totalQ}</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {questions.map((q, idx) => {
                      const isAnswered = !!answers[idx];
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={clsx(
                            "w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer border shrink-0",
                            isCurrent
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105"
                              : isAnswered
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Question Card */}
                {currentQ && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          {tr("Câu")} {currentIndex + 1} / {totalQ}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-2 leading-relaxed">
                          {tr(currentQ.question_text)}
                        </h3>
                        {currentQ.image_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={currentQ.image_url}
                            alt={tr("Ảnh minh họa đề bài")}
                            className="mt-3 max-h-72 w-auto rounded-2xl border border-slate-200 object-contain"
                          />
                        )}
                      </div>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = answers[currentIndex] === opt;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectOption(opt)}
                            className={clsx(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs sm:text-sm font-extrabold",
                              isSelected
                                ? "bg-blue-50/90 border-blue-500 text-blue-950 shadow-sm"
                                : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                            )}
                          >
                            <span className="leading-relaxed">{tr(opt)}</span>
                            <div className={clsx(
                              "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                              isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                            )}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            {isSubmitted ? (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto px-6 py-2.5 rounded-xl font-extrabold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer"
              >
                {tr("Hoàn Tất & Quay Lại Workmap")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors border border-slate-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> {tr("Câu Trước")}
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(prev => Math.min(totalQ - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      {tr("Câu Tiếp")} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {tr("Nộp Bài Trắc Nghiệm")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

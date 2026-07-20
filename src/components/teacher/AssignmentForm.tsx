'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { TaskType, Task } from '@/lib/engine/types';
import { WorkmapCalendar } from './WorkmapCalendar';
import { Sparkles, ArrowRight, Clock, AlertTriangle, Calendar as CalendarIcon, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

export const AssignmentForm = () => {
  const { autoScheduleTask, selectedDate, workmap, addWorkmapEntry, addTask, loadData } = useStore();
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('quiz');
  const [classId, setClassId] = useState('10A');
  
  useEffect(() => {
    loadData(classId);
  }, [classId, loadData]);
  const [subjectId, setSubjectId] = useState('Math');
  const [isGroup, setIsGroup] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deadline, setDeadline] = useState(selectedDate || format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [minutes, setMinutes] = useState(30);

  // Breakdown State
  const [analyzing, setAnalyzing] = useState(false);
  interface BreakdownStep {
    name: string;
    lu: number;
    min: number;
    dayOffset: number;
  }
  const [breakdown, setBreakdown] = useState<BreakdownStep[] | null>(null);

  // Quiz Structure State
  interface QuizLevel {
    id: string;
    name: string;
    desc: string;
    count: number;
    timePerQ: number;
    color: string;
  }
  const [quizStructure, setQuizStructure] = useState<QuizLevel[]>([
    { id: 'l1', name: 'Nhận biết (Dễ)', desc: 'Kiểm tra trí nhớ, định nghĩa, nhận diện trực tiếp', count: 10, timePerQ: 20, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'l2', name: 'Thông hiểu (Trung bình)', desc: 'Giải thích bản chất, so sánh, chứng minh đơn giản', count: 5, timePerQ: 45, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'l3', name: 'Vận dụng (Khó)', desc: 'Giải quyết bài toán qua 2-3 bước suy luận, tính toán', count: 3, timePerQ: 120, color: 'text-orange-500 bg-orange-500/10' },
    { id: 'l4', name: 'Vận dụng cao (Rất khó)', desc: 'Tích hợp kiến thức sâu, tình huống thực tế phức tạp', count: 2, timePerQ: 180, color: 'text-red-500 bg-red-500/10' },
  ]);

  const updateQuizStructure = (id: string, field: 'count' | 'timePerQ', value: number) => {
    setQuizStructure(prev => prev.map(level => level.id === id ? { ...level, [field]: value >= 0 ? value : 0 } : level));
  };

  const totalQuizSeconds = quizStructure.reduce((sum, level) => sum + (level.count * level.timePerQ), 0);
  const totalQuizMinutes = Math.ceil(totalQuizSeconds / 60);
  const totalQuizQuestions = quizStructure.reduce((sum, level) => sum + level.count, 0);
  
  // Overload visual state
  const currentInputMinutes = type === 'quiz' ? totalQuizMinutes : minutes;

  const isDecomposable = type === 'essay' || type === 'project';

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      
      if (isDecomposable) {
        // Generate AI Breakdown
        const steps = type === 'essay' ? [
          { name: 'Tìm hiểu yêu cầu & Nghiên cứu', lu: 1, min: 30, dayOffset: 0 },
          { name: 'Lập dàn ý', lu: 0.5, min: 15, dayOffset: 1 },
          { name: 'Viết bản nháp', lu: 1.5, min: 45, dayOffset: 2 },
          { name: 'Đọc lại & Chỉnh sửa', lu: 0.5, min: 15, dayOffset: 2 }
        ] : [
          { name: 'Lên kế hoạch dự án', lu: 1, min: 30, dayOffset: 0 },
          { name: 'Thu thập dữ liệu', lu: 2, min: 60, dayOffset: 1 },
          { name: 'Thực hiện', lu: 3, min: 90, dayOffset: 3 },
          { name: 'Chuẩn bị thuyết trình', lu: 1, min: 30, dayOffset: 4 }
        ];
        
        setBreakdown(steps);
      } else {
        // Direct schedule for Atomic tasks
        handleConfirmSchedule();
      }
    }, 800);
  };

  const handleUpdateStepName = (idx: number, newName: string) => {
    if (!breakdown) return;
    const updated = [...breakdown];
    updated[idx].name = newName;
    setBreakdown(updated);
  };

  const handleUpdateStepMin = (idx: number, newMin: number) => {
    if (!breakdown) return;
    const updated = [...breakdown];
    updated[idx].min = newMin;
    updated[idx].lu = parseFloat((newMin / 30).toFixed(1));
    setBreakdown(updated);
  };

  const handleRemoveStep = (idx: number) => {
    if (!breakdown) return;
    const updated = breakdown.filter((_, i) => i !== idx);
    setBreakdown(updated.length > 0 ? updated : null);
  };

  const handleAddStep = () => {
    if (!breakdown) return;
    const newStep = { name: 'Bước mới', lu: 1, min: 30, dayOffset: breakdown.length > 0 ? breakdown[breakdown.length - 1].dayOffset + 1 : 0 };
    setBreakdown([...breakdown, newStep]);
  };

  const handleConfirmSchedule = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      type,
      class_id: classId,
      subject_id: subjectId,
      deadline,
      isGroup
    };

    if (isDecomposable && breakdown) {
      autoScheduleTask(newTask, startDate, deadline, currentInputMinutes, breakdown);
      setBreakdown(null);
      setTitle('');
    } else {
      autoScheduleTask(newTask, startDate, deadline, currentInputMinutes);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form & Breakdown */}
      <div className="lg:col-span-7 space-y-8">
        <div>
          <h1 className="text-3xl font-black font-sans tracking-tight mb-2 text-foreground/90">Tạo Bài Tập</h1>
          <p className="text-foreground/60 text-lg">
            Thiết lập chi tiết bài tập. AI sẽ tính toán số LU cần thiết và cảnh báo nếu có nguy cơ quá tải.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 transition-all duration-500 relative overflow-hidden">
          
          <form onSubmit={handleAnalyze} className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Lớp</label>
                <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full border-0 bg-black/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                  <option value="10A">Lớp 10A</option>
                  <option value="10B">Lớp 10B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Môn Học</label>
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full border-0 bg-black/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                  <option value="Math">Toán</option>
                  <option value="Lit">Ngữ Văn</option>
                  <option value="Sci">Khoa Học</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Tên Bài Tập</label>
              <input 
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner placeholder:text-foreground/30"
                placeholder="VD: Bài luận cuối kỳ" required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Dạng Bài</label>
                <select value={type} onChange={e => setType(e.target.value as TaskType)} className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-foreground">
                  <option value="quiz">Trắc nghiệm (Nguyên khối)</option>
                  <option value="chart">Biểu đồ (Nguyên khối)</option>
                  <option value="essay">Bài Luận (Chia nhỏ được)</option>
                  <option value="project">Dự án (Chia nhỏ được)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Hình Thức</label>
                <select value={isGroup ? 'group' : 'individual'} onChange={e => setIsGroup(e.target.value === 'group')} className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-foreground">
                  <option value="individual">Cá nhân</option>
                  <option value="group">Làm nhóm</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Ngày Giao</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest">Hạn Nộp</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-foreground" />
              </div>
            </div>

            {!isDecomposable && type !== 'quiz' && (
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                  Số Phút Dự Kiến
                </label>
                <input 
                  type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min={15} step={15}
                  className="w-full border-0 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner text-primary"
                />
              </div>
            )}

            {type === 'quiz' && (
              <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-lg mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-foreground/80 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Phân Bố Cấu Trúc Đề
                  </h3>
                  <div className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Hệ thống tự động tính Phút
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-foreground/50 uppercase tracking-widest px-2">
                    <div className="col-span-5">Độ khó</div>
                    <div className="col-span-3 text-center">Số câu</div>
                    <div className="col-span-4 text-right">Giây / câu</div>
                  </div>
                  
                  {quizStructure.map(level => (
                    <div key={level.id} className="grid grid-cols-12 gap-4 items-center bg-white/40 p-3 rounded-xl border border-white/50 hover:bg-white/60 transition-colors">
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${level.color.split(' ')[1].replace('/10', '')}`} />
                          <div className="font-bold text-sm text-foreground/80">{level.name}</div>
                        </div>
                        <div className="text-[10px] text-foreground/50 mt-1 truncate pr-2" title={level.desc}>{level.desc}</div>
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number" min={0} value={level.count} 
                          onChange={(e) => updateQuizStructure(level.id, 'count', parseInt(e.target.value) || 0)}
                          className="w-full text-center bg-white/60 border border-white/80 rounded-lg py-2 font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                        />
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <input 
                          type="number" min={0} step={5} value={level.timePerQ} 
                          onChange={(e) => updateQuizStructure(level.id, 'timePerQ', parseInt(e.target.value) || 0)}
                          className="w-full text-right bg-white/60 border border-white/80 rounded-lg py-2 px-3 font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                        />
                        <span className="text-xs font-semibold text-foreground/50">s</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/50 flex justify-between items-center px-2">
                  <div className="font-bold text-foreground/70">Tổng cộng: <span className="text-foreground/90">{totalQuizQuestions} câu</span></div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">
                      {totalQuizMinutes} <span className="text-sm font-semibold uppercase text-foreground/50">phút</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              type="submit" disabled={analyzing}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${analyzing ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1'}`}
            >
              {analyzing ? (
                <span className="animate-pulse">Đang phân tích dữ liệu...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Phân tích & Xếp lịch
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Breakdown Timeline for Decomposable Tasks */}
        {breakdown && (
          <div className="glass-card rounded-3xl p-8 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground/80">
              <Sparkles className="w-6 h-6 text-accent" /> Phân Rã Bằng AI
            </h3>
            
            <div className="space-y-4 mb-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-accent before:opacity-30">
              {breakdown.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-primary text-white font-bold shadow-lg shadow-primary/20 shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <textarea 
                        value={step.name}
                        onChange={(e) => handleUpdateStepName(idx, e.target.value)}
                        rows={2}
                        className="font-bold text-foreground/90 bg-transparent border-b border-transparent hover:border-black/10 focus:border-primary focus:outline-none flex-1 min-w-0 resize-none overflow-hidden leading-snug py-1 break-all"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary font-bold text-xs rounded-lg whitespace-nowrap">{step.lu} LU</span>
                        <button type="button" onClick={() => handleRemoveStep(idx)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors shrink-0" title="Xóa bước này">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-semibold text-foreground/50 flex-wrap">
                      <span className="flex items-center gap-1.5 whitespace-nowrap text-primary">
                        <CalendarIcon className="w-4 h-4" /> {format(addDays(new Date(startDate), step.dayOffset), 'dd/MM/yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-4 h-4" /> 
                        <input 
                          type="number" min={5} step={5}
                          value={step.min}
                          onChange={(e) => handleUpdateStepMin(idx, parseInt(e.target.value) || 0)}
                          className="w-12 bg-transparent border-b border-transparent hover:border-black/10 focus:border-primary focus:outline-none text-right"
                        /> phút
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="w-full border-2 border-dashed border-primary/30 text-primary font-bold py-3 rounded-xl mb-6 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Thêm Bước Mới
            </button>

            <button 
              onClick={handleConfirmSchedule}
              className="w-full bg-foreground text-background font-bold py-4 rounded-xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-lg"
            >
              <CheckCircle2 className="w-5 h-5" /> Xác nhận & Giao bài
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Mini Workmap Preview */}
      <div className="lg:col-span-5 relative">
        <div className="sticky top-8">
          <WorkmapCalendar classId={classId} />
        </div>
      </div>
    </div>
  );
};

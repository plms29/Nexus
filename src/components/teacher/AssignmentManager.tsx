'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Task } from '@/lib/engine/types';
import { 
  fetchQuestionsForTask, 
  saveQuestionInDb, 
  deleteQuestionFromDb, 
  QuestionItem 
} from '@/lib/api';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Save, 
  X, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Sparkles, 
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const AssignmentManager: React.FC = () => {
  const { tasks, workmap, updateTask, deleteTask, classes, subjects } = useStore();
  
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editIsGroup, setEditIsGroup] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Delete Task Modal State
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Questions Manager Modal State
  const [managingQuestionsTask, setManagingQuestionsTask] = useState<Task | null>(null);
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Add / Edit Single Question Form State inside Questions Modal
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [qText, setQText] = useState('');
  const [qOptionA, setQOptionA] = useState('');
  const [qOptionB, setQOptionB] = useState('');
  const [qOptionC, setQOptionC] = useState('');
  const [qOptionD, setQOptionD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qLevel, setQLevel] = useState<'l1' | 'l2' | 'l3' | 'l4'>('l1');
  const [qExplanation, setQExplanation] = useState('');
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);

  // Filter tasks list
  const filteredTasks = tasks.filter(t => {
    if (filterClass !== 'all' && t.class_id !== filterClass) return false;
    if (filterSubject !== 'all' && t.subject_id !== filterSubject) return false;
    return true;
  });

  // Open Edit Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditClassId(task.class_id);
    setEditSubjectId(task.subject_id);
    setEditDeadline(task.deadline);
    setEditIsGroup(task.isGroup);
  };

  // Submit Edit Task
  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    setIsSavingTask(true);
    const success = await updateTask(editingTask.id, {
      title: editTitle.trim(),
      class_id: editClassId,
      subject_id: editSubjectId,
      deadline: editDeadline,
      isGroup: editIsGroup
    });
    setIsSavingTask(false);

    if (success) {
      setEditingTask(null);
    } else {
      alert('Lỗi cập nhật bài tập!');
    }
  };

  // Submit Delete Task
  const handleConfirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    const success = await deleteTask(deletingTaskId);
    setIsDeleting(false);

    if (success) {
      setDeletingTaskId(null);
    } else {
      alert('Lỗi xóa bài tập!');
    }
  };

  // Load Questions for a Task
  const handleOpenQuestionsModal = async (task: Task) => {
    setManagingQuestionsTask(task);
    setIsLoadingQuestions(true);
    setIsAddingNewQuestion(false);
    setEditingQuestion(null);

    const fetched = await fetchQuestionsForTask(task.id);
    if (fetched && fetched.length > 0) {
      setQuestionsList(fetched);
    } else {
      // Default demo questions if empty
      setQuestionsList([
        {
          id: 'demo-1',
          task_id: task.id,
          question_text: `Câu 1 (${task.title}): Hãy chọn khẳng định đúng nhất về chủ đề này.`,
          options: ['Đáp án A: Đúng hoàn toàn', 'Đáp án B: Sai một phần', 'Đáp án C: Chưa đủ dữ kiện', 'Đáp án D: Tất cả đều sai'],
          correct_answer: 'A',
          level: 'l1',
          explanation: 'Giải thích chi tiết: Lựa chọn A thỏa mãn đầy đủ các điều kiện lý thuyết.'
        },
        {
          id: 'demo-2',
          task_id: task.id,
          question_text: `Câu 2 (${task.title}): Tính toán giá trị hoặc phân tích tình huống thực tế sau.`,
          options: ['Phương án 1: Kết quả = 100', 'Phương án 2: Kết quả = 250', 'Phương án 3: Kết quả = 500', 'Phương án 4: Kết quả = 1000'],
          correct_answer: 'B',
          level: 'l2',
          explanation: 'Giải thích chi tiết: Áp dụng công thức và tính ra giá trị 250.'
        }
      ]);
    }
    setIsLoadingQuestions(false);
  };

  // Open Form to Add/Edit Question
  const handleStartEditQuestion = (q?: QuestionItem) => {
    if (q) {
      setEditingQuestion(q);
      setQText(q.question_text);
      setQOptionA(q.options[0] || '');
      setQOptionB(q.options[1] || '');
      setQOptionC(q.options[2] || '');
      setQOptionD(q.options[3] || '');
      setQCorrect(q.correct_answer || 'A');
      setQLevel(q.level || 'l1');
      setQExplanation(q.explanation || '');
      setIsAddingNewQuestion(false);
    } else {
      setEditingQuestion(null);
      setQText('');
      setQOptionA('');
      setQOptionB('');
      setQOptionC('');
      setQOptionD('');
      setQCorrect('A');
      setQLevel('l1');
      setQExplanation('');
      setIsAddingNewQuestion(true);
    }
  };

  // Save Question (Add or Update)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingQuestionsTask || !qText.trim()) return;

    setIsSavingQuestion(true);
    const newQuestionData: QuestionItem = {
      id: editingQuestion?.id,
      task_id: managingQuestionsTask.id,
      question_text: qText.trim(),
      options: [qOptionA, qOptionB, qOptionC, qOptionD],
      correct_answer: qCorrect,
      level: qLevel,
      explanation: qExplanation
    };

    const res = await saveQuestionInDb(newQuestionData);
    setIsSavingQuestion(false);

    if (res.success) {
      if (editingQuestion) {
        setQuestionsList(prev => prev.map(item => item.id === editingQuestion.id ? { ...newQuestionData, id: res.data?.id || editingQuestion.id } : item));
      } else {
        setQuestionsList(prev => [...prev, { ...newQuestionData, id: res.data?.id || crypto.randomUUID() }]);
      }
      setIsAddingNewQuestion(false);
      setEditingQuestion(null);
    } else {
      // Local fallback for demo
      if (editingQuestion) {
        setQuestionsList(prev => prev.map(item => item.id === editingQuestion.id ? newQuestionData : item));
      } else {
        setQuestionsList(prev => [...prev, { ...newQuestionData, id: crypto.randomUUID() }]);
      }
      setIsAddingNewQuestion(false);
      setEditingQuestion(null);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId?: string) => {
    if (!qId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    await deleteQuestionFromDb(qId);
    setQuestionsList(prev => prev.filter(q => q.id !== qId));
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="glass-card rounded-3xl p-6 bg-white/80 border border-white/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Bài Tập & Đề Thi Đã Giao
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Giáo viên có toàn quyền chỉnh sửa, xóa, đổi tên, thêm/bớt và biên tập nội dung câu hỏi bài tập của mình.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase px-2">Lớp:</span>
            <select 
              value={filterClass} 
              onChange={e => setFilterClass(e.target.value)} 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả các lớp</option>
              {classes?.map((c: string) => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase px-2">Môn:</span>
            <select 
              value={filterSubject} 
              onChange={e => setFilterSubject(e.target.value)} 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả môn học</option>
              {subjects?.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignment Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">Chưa có bài tập nào</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
            Bạn chưa giao bài tập nào cho lớp học đã chọn. Hãy chuyển sang mục "Tạo Bài Tập" để giao bài mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const taskEntries = workmap.filter(w => w.task_id === task.id);
            const totalLU = taskEntries.reduce((sum, e) => sum + e.lu, 0);

            return (
              <div 
                key={task.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group relative"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80">
                      Môn {task.subject_id}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                      Lớp {task.class_id}
                    </span>
                  </div>

                  {/* Task Title */}
                  <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>

                  {/* Task Meta Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-semibold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Dạng bài:</span>
                      <strong className="text-slate-800 capitalize">
                        {task.type === 'quiz' ? 'Trắc nghiệm' : task.type === 'essay' ? 'Bài luận' : task.type === 'project' ? 'Dự án' : task.type}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hình thức:</span>
                      <strong className="text-slate-800">{task.isGroup ? 'Làm nhóm' : 'Cá nhân'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tải học tập:</span>
                      <strong className="text-blue-600 font-black">{totalLU > 0 ? `${totalLU.toFixed(1)} LU` : 'Tự động tính'}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="flex items-center gap-1 text-slate-500">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Hạn nộp:
                      </span>
                      <strong className="text-slate-900 font-black">{task.deadline}</strong>
                    </div>
                  </div>
                </div>

                {/* Teacher Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionsModal(task)}
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-200/60 cursor-pointer"
                    title="Quản lý & Chỉnh sửa câu hỏi"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Câu hỏi
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(task)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                    title="Đổi tên & Sửa thông tin bài tập"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingTaskId(task.id)}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 border border-rose-200/60 cursor-pointer"
                    title="Xóa bài tập này"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" /> Chỉnh Sửa Thông Tin Bài Tập
                </h3>
                <button 
                  type="button" 
                  onClick={() => setEditingTask(null)} 
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTaskEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">Tên Bài Tập</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase">Lớp học</label>
                    <select 
                      value={editClassId} 
                      onChange={e => setEditClassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {classes?.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase">Bộ môn</label>
                    <select 
                      value={editSubjectId} 
                      onChange={e => setEditSubjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {subjects?.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <DatePicker 
                    label="Hạn Nộp Mới"
                    value={editDeadline}
                    onChange={setEditDeadline}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">Hình Thức</label>
                  <select 
                    value={editIsGroup ? 'group' : 'individual'} 
                    onChange={e => setEditIsGroup(e.target.value === 'group')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="individual">Cá nhân</option>
                    <option value="group">Làm nhóm</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTask}
                    className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {isSavingTask ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTaskId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingTaskId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Xác Nhận Xóa Bài Tập?</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Bài tập này và toàn bộ dữ liệu phân bổ Workmap liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTaskId(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTask}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> {isDeleting ? 'Đang xóa...' : 'Xóa Bài Tập'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Manage & Edit Questions Modal */}
      <AnimatePresence>
        {managingQuestionsTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManagingQuestionsTask(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      Quản Lý & Chỉnh Sửa Câu Hỏi ({managingQuestionsTask.title})
                    </h3>
                    <p className="text-xs text-blue-200 font-medium">
                      Thêm, xóa, sửa nội dung đề bài, các lựa chọn đáp án và mức độ nhận thức.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setManagingQuestionsTask(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)] custom-scrollbar">
                {/* Header Action: Add Question Button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    Danh Sách Câu Hỏi ({questionsList.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleStartEditQuestion()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm Câu Hỏi Mới
                  </button>
                </div>

                {/* Form to Add/Edit Single Question if active */}
                {(isAddingNewQuestion || editingQuestion) && (
                  <motion.form 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveQuestion}
                    className="p-5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                      <h5 className="font-black text-blue-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        {editingQuestion ? 'Biên Tập Nội Dung Câu Hỏi' : 'Thêm Câu Hỏi Mới Cho Bài Tập'}
                      </h5>
                      <button
                        type="button"
                        onClick={() => { setIsAddingNewQuestion(false); setEditingQuestion(null); }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Hủy
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase">Nội dung câu hỏi / Đề bài</label>
                      <textarea
                        value={qText}
                        onChange={e => setQText(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập nội dung đề bài..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Đáp án A</label>
                        <input type="text" value={qOptionA} onChange={e => setQOptionA(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" placeholder="Lựa chọn A..." />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Đáp án B</label>
                        <input type="text" value={qOptionB} onChange={e => setQOptionB(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" placeholder="Lựa chọn B..." />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Đáp án C</label>
                        <input type="text" value={qOptionC} onChange={e => setQOptionC(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" placeholder="Lựa chọn C..." />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Đáp án D</label>
                        <input type="text" value={qOptionD} onChange={e => setQOptionD(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" placeholder="Lựa chọn D..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Đáp án ĐÚNG</label>
                        <select value={qCorrect} onChange={e => setQCorrect(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold">
                          <option value="A">Đáp án A</option>
                          <option value="B">Đáp án B</option>
                          <option value="C">Đáp án C</option>
                          <option value="D">Đáp án D</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Mức độ nhận thức</label>
                        <select value={qLevel} onChange={e => setQLevel(e.target.value as any)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold">
                          <option value="l1">Nhận biết (Dễ)</option>
                          <option value="l2">Thông hiểu (Trung bình)</option>
                          <option value="l3">Vận dụng (Khó)</option>
                          <option value="l4">Vận dụng cao (Rất khó)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Lời giải chi tiết / Hướng dẫn</label>
                      <input 
                        type="text" 
                        value={qExplanation} 
                        onChange={e => setQExplanation(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        placeholder="Nhập hướng dẫn giải..." 
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsAddingNewQuestion(false); setEditingQuestion(null); }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingQuestion}
                        className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      >
                        {isSavingQuestion ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Questions List Render */}
                {isLoadingQuestions ? (
                  <div className="text-center py-8 text-xs font-bold text-slate-400">
                    Đang tải danh sách câu hỏi...
                  </div>
                ) : questionsList.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs font-bold">
                    Bài tập này chưa có câu hỏi nào. Bấm nút "Thêm Câu Hỏi Mới" ở trên để bổ sung.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questionsList.map((q, idx) => (
                      <div 
                        key={q.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="font-extrabold text-slate-900 text-sm leading-relaxed">
                              {q.question_text}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditQuestion(q)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Sửa nội dung câu hỏi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold pl-8">
                          {q.options.map((opt, optIdx) => {
                            const optLetter = String.fromCharCode(65 + optIdx);
                            const isCorrect = q.correct_answer === optLetter;

                            return (
                              <div 
                                key={optIdx}
                                className={clsx(
                                  "p-2 rounded-xl border flex items-center gap-2",
                                  isCorrect ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold" : "bg-slate-50 text-slate-700 border-slate-200"
                                )}
                              >
                                <span className={clsx("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0", isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600")}>
                                  {optLetter}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100 ml-8">
                            <span className="font-extrabold text-slate-700">Lời giải:</span> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-slate-500">
                  ExamLoad Radar • Toàn quyền chỉnh sửa đề thi cho Giáo viên bộ môn
                </span>
                <button
                  type="button"
                  onClick={() => setManagingQuestionsTask(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Hoàn Tất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

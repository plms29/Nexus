'use client';

import { useTranslate } from '@/lib/i18n';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  fetchQuestionPackages, 
  createQuestionPackage, 
  deleteQuestionPackage, 
  fetchQuestionsForPackage, 
  saveQuestionInDb,
  deleteQuestionFromDb,
  uploadQuestionImage,
  QuestionPackage,
  QuestionItem
} from '@/lib/api';
import { 
  Plus, 
  FolderPlus, 
  Folder, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowLeft, 
  FileSpreadsheet, 
  HelpCircle,
  BookOpen,
  Layers,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const difficultyMap = {
  l1: { title: 'Nhận biết', color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-100' },
  l2: { title: 'Thông hiểu', color: 'text-blue-700 border-blue-200', bg: 'bg-blue-100' },
  l3: { title: 'Vận dụng', color: 'text-amber-800 border-amber-200', bg: 'bg-amber-100' },
  l4: { title: 'Vận dụng cao', color: 'text-rose-700 border-rose-200', bg: 'bg-rose-100' },
};

// Robust CSV Parsing Helpers
const parseCsvRow = (line: string): string[] => {
  const delimiter = line.includes(';') && (line.split(';').length > line.split(',').length) ? ';' : ',';
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
};

const mapLevelStringToCode = (val: string): 'l1' | 'l2' | 'l3' | 'l4' => {
  const v = (val || '').toLowerCase().trim();
  if (v === 'l1' || v === '1' || v.includes('nhận biết') || v.includes('nhan biet') || v.includes('dễ') || v.includes('de')) return 'l1';
  if (v === 'l2' || v === '2' || v.includes('thông hiểu') || v.includes('thong hieu') || v.includes('trung bình')) return 'l2';
  if (v.includes('vận dụng cao') || v.includes('van dung cao') || v.includes('rất khó') || v === 'l4' || v === '4') return 'l4';
  if (v === 'l3' || v === '3' || v.includes('vận dụng') || v.includes('van dung') || v.includes('khó')) return 'l3';
  return 'l1';
};

export default function QuestionBank() {
  const tr = useTranslate();
  const { classes, subjects } = useStore();

  // State: Packages List
  const [packages, setPackages] = useState<QuestionPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState<boolean>(true);

  // Active Selected Package View
  const [activePackage, setActivePackage] = useState<QuestionPackage | null>(null);
  const [packageQuestions, setPackageQuestions] = useState<QuestionItem[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [activeDiffFilter, setActiveDiffFilter] = useState<string>('all');

  // Modal State: Create New Package
  const [isCreatePkgOpen, setIsCreatePkgOpen] = useState<boolean>(false);
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgSubject, setNewPkgSubject] = useState(subjects?.[0] || 'Toán');
  const [newPkgGrade, setNewPkgGrade] = useState(classes?.[0] || '10A');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [isSavingPkg, setIsSavingPkg] = useState(false);

  // Modal State: Delete Package Confirmation
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);
  const [isDeletingPkg, setIsDeletingPkg] = useState(false);

  // Modal State: Add/Edit Question inside Package
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qLevel, setQLevel] = useState<'l1' | 'l2' | 'l3' | 'l4'>('l1');
  const [qExplanation, setQExplanation] = useState('');
  const [qImageUrl, setQImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const questionImageInputRef = React.useRef<HTMLInputElement>(null);

  // State: CSV Upload
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Initial Load: Fetch packages from Supabase
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoadingPackages(true);
    const data = await fetchQuestionPackages();
    setPackages(data);
    setIsLoadingPackages(false);
  };

  // Open a package and fetch its questions from Supabase
  const handleOpenPackage = async (pkg: QuestionPackage) => {
    setActivePackage(pkg);
    setIsLoadingQuestions(true);
    const qData = await fetchQuestionsForPackage(pkg.id);
    setPackageQuestions(qData);
    setIsLoadingQuestions(false);
  };

  // Submit Create New Package
  const handleCreatePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgTitle.trim()) return;

    setIsSavingPkg(true);
    const res = await createQuestionPackage({
      title: newPkgTitle.trim(),
      subject: newPkgSubject,
      grade_class: newPkgGrade,
      description: newPkgDesc.trim()
    });
    setIsSavingPkg(false);

    if (res.success && res.data) {
      setPackages(prev => [res.data!, ...prev]);
      setIsCreatePkgOpen(false);
      setNewPkgTitle('');
      setNewPkgDesc('');
      handleOpenPackage(res.data);
    } else {
      alert(tr("Lỗi tạo gói câu hỏi trên Supabase!"));
    }
  };

  // Confirm Delete Package
  const handleConfirmDeletePackage = async () => {
    if (!deletingPkgId) return;
    setIsDeletingPkg(true);
    const res = await deleteQuestionPackage(deletingPkgId);
    setIsDeletingPkg(false);

    if (res.success) {
      setPackages(prev => prev.filter(p => p.id !== deletingPkgId));
      if (activePackage?.id === deletingPkgId) {
        setActivePackage(null);
      }
      setDeletingPkgId(null);
    } else {
      alert(tr("Lỗi xóa gói câu hỏi!"));
    }
  };

  // Open Form to Add/Edit Question inside active package
  const handleStartQuestionForm = (q?: QuestionItem) => {
    if (q) {
      setEditingQuestion(q);
      setQText(q.question_text);
      setQOptA(q.options[0] || '');
      setQOptB(q.options[1] || '');
      setQOptC(q.options[2] || '');
      setQOptD(q.options[3] || '');
      setQCorrect(q.correct_answer || 'A');
      setQLevel(q.level || 'l1');
      setQExplanation(q.explanation || '');
      setQImageUrl(q.image_url || null);
      setImageError(null);
      setIsAddQuestionOpen(true);
    } else {
      setEditingQuestion(null);
      setQText('');
      setQOptA('');
      setQOptB('');
      setQOptC('');
      setQOptD('');
      setQCorrect('A');
      setQLevel('l1');
      setQExplanation('');
      setQImageUrl(null);
      setImageError(null);
      setIsAddQuestionOpen(true);
    }
  };

  // Upload ảnh minh họa cho câu hỏi lên Supabase Storage
  const handlePickQuestionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImageError(null);
    setIsUploadingImage(true);
    const res = await uploadQuestionImage(file);
    setIsUploadingImage(false);

    if (res.success && res.url) {
      setQImageUrl(res.url);
    } else {
      setImageError(res.error || 'Không tải được ảnh lên, thử lại nhé.');
    }
  };

  // Save Question (Insert/Update to Supabase)
  const handleSaveQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage || !qText.trim()) return;

    setIsSavingQuestion(true);
    const questionPayload: QuestionItem = {
      id: editingQuestion?.id,
      package_id: activePackage.id,
      question_text: qText.trim(),
      options: [qOptA.trim(), qOptB.trim(), qOptC.trim(), qOptD.trim()],
      correct_answer: qCorrect,
      level: qLevel,
      explanation: qExplanation.trim(),
      image_url: qImageUrl
    };

    const res = await saveQuestionInDb(questionPayload);
    setIsSavingQuestion(false);

    if (res.success && res.data) {
      if (editingQuestion) {
        setPackageQuestions(prev => prev.map(item => item.id === editingQuestion.id ? res.data : item));
      } else {
        setPackageQuestions(prev => [...prev, res.data]);
        setPackages(prev => prev.map(p => p.id === activePackage.id ? { ...p, questions_count: (p.questions_count || 0) + 1 } : p));
      }
      setIsAddQuestionOpen(false);
      setEditingQuestion(null);
    } else {
      alert(tr("Lỗi lưu câu hỏi vào Supabase!"));
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId?: string) => {
    if (!qId || !activePackage) return;
    if (!confirm(tr("Bạn có chắc chắn muốn xóa câu hỏi này khỏi gói?"))) return;

    const res = await deleteQuestionFromDb(qId);
    if (res.success) {
      setPackageQuestions(prev => prev.filter(q => q.id !== qId));
      setPackages(prev => prev.map(p => p.id === activePackage.id ? { ...p, questions_count: Math.max(0, (p.questions_count || 1) - 1) } : p));
    } else {
      alert(tr("Lỗi xóa câu hỏi!"));
    }
  };

  // Download Sample CSV Template (Formatted with UTF-8 BOM)
  const handleDownloadCsvTemplate = () => {
    const csvContent = 
      '\uFEFF' + // UTF-8 BOM
      'Nội dung câu hỏi,Mức độ (l1/l2/l3/l4),Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Lời giải chi tiết\n' +
      '"Cho phương trình x^2 - 4 = 0. Nghiệm của phương trình là gì?",l1,"x = ±2","x = 2","x = 4","Vô nghiệm",A,"Phương trình tương đương x^2 = 4 => x = ±2."\n' +
      '"Định lý Py-ta-go áp dụng cho tam giác nào?",l1,"Tam giác vuông","Tam giác đều","Tam giác cân","Tam giác tù",A,"Định lý Py-ta-go phát biểu trong tam giác vuông: a^2 + b^2 = c^2."\n' +
      '"Giải bất phương trình: 2x - 4 > 0.",l2,"x > 2","x < 2","x > 4","x < 0",A,"2x > 4 <=> x > 2."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Mau_Ngan_Hang_Cau_Hoi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV File and import questions into current active package
  const handleUploadCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePackage) return;

    setIsUploadingCsv(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length <= 1) {
          alert(tr("File CSV trống hoặc không chứa dữ liệu câu hỏi!"));
          setIsUploadingCsv(false);
          return;
        }

        const newQuestions: QuestionItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cleanValues = parseCsvRow(line);
          if (cleanValues.length < 7) continue;

          const [qText, qLevelStr, optA, optB, optC, optD, correctAns, explanation] = cleanValues;

          if (qText && optA && optB) {
            const validLevel = mapLevelStringToCode(qLevelStr);
            const validCorrect = ['A', 'B', 'C', 'D'].includes((correctAns || 'A').toUpperCase()) ? correctAns.toUpperCase() : 'A';

            newQuestions.push({
              package_id: activePackage.id,
              question_text: qText,
              options: [optA, optB, optC || '', optD || ''],
              correct_answer: validCorrect,
              level: validLevel,
              explanation: explanation || ''
            });
          }
        }

        if (newQuestions.length === 0) {
          alert(tr("Không tìm thấy câu hỏi hợp lệ nào trong file CSV!"));
          setIsUploadingCsv(false);
          return;
        }

        let successCount = 0;
        for (const q of newQuestions) {
          const res = await saveQuestionInDb(q);
          if (res.success) successCount++;
        }

        const updatedQuestions = await fetchQuestionsForPackage(activePackage.id);
        setPackageQuestions(updatedQuestions);
        setPackages(prev => prev.map(p => p.id === activePackage.id ? { ...p, questions_count: updatedQuestions.length } : p));

        alert(`Đã tải lên thành công ${successCount} câu hỏi vào gói "${tr(activePackage.title)}"!`);
      } catch (err) {
        console.error('Lỗi đọc file CSV:', err);
        alert(tr("Lỗi khi đọc file CSV. Vui lòng kiểm tra lại định dạng file!"));
      } finally {
        setIsUploadingCsv(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Upload CSV File and automatically create a new Package from file name + import all questions
  const handleUploadCsvToNewPackage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCsv(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length <= 1) {
          alert(tr("File CSV trống hoặc không chứa dữ liệu câu hỏi!"));
          setIsUploadingCsv(false);
          return;
        }

        const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const pkgTitle = `Gói: ${fileNameNoExt}`;

        const pkgRes = await createQuestionPackage({
          title: pkgTitle,
          subject: subjects?.[0] || 'Toán',
          grade_class: classes?.[0] || '10A',
          description: `Gói câu hỏi tự động khởi tạo từ file CSV: ${file.name}`
        });

        if (!pkgRes.success || !pkgRes.data) {
          alert(tr("Lỗi tạo gói câu hỏi mới trên Supabase!"));
          setIsUploadingCsv(false);
          return;
        }

        const newPkg = pkgRes.data;

        const newQuestions: QuestionItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cleanValues = parseCsvRow(line);
          if (cleanValues.length < 7) continue;

          const [qText, qLevelStr, optA, optB, optC, optD, correctAns, explanation] = cleanValues;

          if (qText && optA && optB) {
            const validLevel = mapLevelStringToCode(qLevelStr);
            const validCorrect = ['A', 'B', 'C', 'D'].includes((correctAns || 'A').toUpperCase()) ? correctAns.toUpperCase() : 'A';

            newQuestions.push({
              package_id: newPkg.id,
              question_text: qText,
              options: [optA, optB, optC || '', optD || ''],
              correct_answer: validCorrect,
              level: validLevel,
              explanation: explanation || ''
            });
          }
        }

        if (newQuestions.length === 0) {
          alert(tr("Không tìm thấy câu hỏi hợp lệ nào trong file CSV!"));
          setIsUploadingCsv(false);
          return;
        }

        let successCount = 0;
        for (const q of newQuestions) {
          const res = await saveQuestionInDb(q);
          if (res.success) successCount++;
        }

        await loadPackages();
        handleOpenPackage(newPkg);

        alert(`Đã tự động khởi tạo gói "${newPkg.title}" và tải lên ${successCount} câu hỏi thành công!`);
      } catch (err) {
        console.error('Lỗi đọc file CSV:', err);
        alert(tr("Lỗi khi đọc file CSV. Vui lòng kiểm tra lại định dạng file!"));
      } finally {
        setIsUploadingCsv(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Filtered questions inside active package
  const filteredPackageQuestions = activeDiffFilter === 'all'
    ? packageQuestions
    : packageQuestions.filter(q => q.level === activeDiffFilter);

  return (
    <div className="w-full space-y-6">
      {/* 1. Main View: Package List View */}
      {!activePackage ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Folder className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {tr("Ngân Hàng Gói Câu Hỏi Đề Thi")}
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {tr("Kho dữ liệu gói câu hỏi riêng của giáo viên, nhập dữ liệu từ file CSV mẫu và lưu trữ trực tiếp trên hệ thống Supabase.")}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center gap-2 border border-slate-200/80 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" /> {tr("Tải Template CSV Mẫu")}
              </button>

              <label className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20">
                <Upload className="w-4 h-4" />
                {isUploadingCsv ? tr("Đang tạo gói...") : tr("Upload CSV ➔ Tự Tạo Gói Mới")}
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleUploadCsvToNewPackage} 
                  disabled={isUploadingCsv}
                  className="hidden" 
                />
              </label>

              <button
                type="button"
                onClick={() => setIsCreatePkgOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" /> {tr("Tạo Gói Câu Hỏi Mới")}
              </button>
            </div>
          </div>

          {/* Packages List Grid */}
          {isLoadingPackages ? (
            <div className="text-center py-16 text-xs font-extrabold text-slate-400">
              {tr("Đang tải danh sách gói câu hỏi từ Supabase...")}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">{tr("Chưa có gói câu hỏi nào")}</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                {tr("Hãy bấm nút \"Tạo Gói Câu Hỏi Mới\" hoặc \"Upload CSV ➔ Tự Tạo Gói Mới\" ở trên.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleOpenPackage(pkg)}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer relative"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {tr("Môn")} {tr(pkg.subject)}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200/80">
                        {tr("Kho riêng giáo viên")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {tr(pkg.title)}
                    </h3>

                    {/* Description */}
                    {pkg.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">
                        {tr(pkg.description)}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{pkg.questions_count || 0} {tr("câu hỏi")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPkgId(pkg.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={tr("Xóa gói câu hỏi này")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. Active Package Detail View & Questions Editor */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setActivePackage(null); loadPackages(); }}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title={tr("Quay lại danh sách gói")}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {tr(activePackage.title)}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    {tr("Môn")} {tr(activePackage.subject)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {tr("Tổng số câu trong gói:")} <strong className="text-slate-900">{packageQuestions.length} {tr("câu")}</strong>{tr(". Đã đồng bộ Supabase DB.")}
                </p>
              </div>
            </div>

            {/* Package Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> {tr("Tải Template CSV")}
              </button>

              <label className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20">
                <Upload className="w-3.5 h-3.5" />
                {isUploadingCsv ? tr("Đang đọc CSV...") : 'Upload File CSV'}
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleUploadCsvFile} 
                  disabled={isUploadingCsv}
                  className="hidden" 
                />
              </label>

              <button
                type="button"
                onClick={() => handleStartQuestionForm()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {tr("Thêm Câu Hỏi Thủ Công")}
              </button>
            </div>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
            {[
              { id: 'all', label: `${tr('Tất cả')} (${packageQuestions.length})` },
              { id: 'l1', label: `${tr('Nhận biết')} (${packageQuestions.filter(q => q.level === 'l1').length})` },
              { id: 'l2', label: `${tr('Thông hiểu')} (${packageQuestions.filter(q => q.level === 'l2').length})` },
              { id: 'l3', label: `${tr('Vận dụng')} (${packageQuestions.filter(q => q.level === 'l3').length})` },
              { id: 'l4', label: `${tr('Vận dụng cao')} (${packageQuestions.filter(q => q.level === 'l4').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDiffFilter(tab.id)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border",
                  activeDiffFilter === tab.id
                    ? "bg-white text-blue-700 shadow-sm border-slate-200"
                    : "text-slate-500 border-transparent hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Questions List Render */}
          {isLoadingQuestions ? (
            <div className="text-center py-12 text-xs font-extrabold text-slate-400">
              {tr("Đang tải danh sách câu hỏi trong gói...")}
            </div>
          ) : filteredPackageQuestions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 text-slate-500 text-xs font-bold space-y-2">
              <p>{tr("Gói câu hỏi này chưa có dữ liệu ở mức độ đã chọn.")}</p>
              <p className="text-[11px] text-slate-400">{tr("Bạn có thể bấm \"Upload File CSV\" hoặc \"Thêm Câu Hỏi Thủ Công\" để bổ sung.")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPackageQuestions.map((q, idx) => {
                const diffMeta = difficultyMap[q.level || 'l1'];

                return (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={clsx("text-xs font-extrabold px-2.5 py-0.5 rounded-lg border", diffMeta.bg, diffMeta.color)}>
                              {tr(diffMeta.title)}
                            </span>
                          </div>
                          <div className="font-extrabold text-slate-900 text-base leading-relaxed">
                            {tr(q.question_text)}
                          </div>
                          {q.image_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={q.image_url}
                              alt={tr("Ảnh minh họa câu hỏi")}
                              className="mt-3 max-h-56 w-auto rounded-xl border border-slate-200 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartQuestionForm(q)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={tr("Sửa câu hỏi")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={tr("Xóa câu hỏi")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold pl-9">
                      {q.options.map((opt, optIdx) => {
                        const optLetter = String.fromCharCode(65 + optIdx);
                        const isCorrect = q.correct_answer === optLetter;

                        return (
                          <div
                            key={optIdx}
                            className={clsx(
                              "p-3 rounded-xl border flex items-center justify-between gap-2",
                              isCorrect 
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold" 
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={clsx(
                                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                              )}>
                                {optLetter}
                              </span>
                              <span className="truncate">{tr(opt)}</span>
                            </div>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 ml-9">
                        <strong className="text-slate-800 font-extrabold uppercase text-[10px] block mb-1">{tr("Giải thích đáp án đúng:")}</strong>
                        {tr(q.explanation)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Question Package */}
      <AnimatePresence>
        {isCreatePkgOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatePkgOpen(false)}
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
                  <FolderPlus className="w-5 h-5 text-blue-600" /> {tr("Tạo Gói Câu Hỏi Mới")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatePkgOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePackageSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">{tr("Tên Gói Câu Hỏi")}</label>
                  <input
                    type="text"
                    value={newPkgTitle}
                    onChange={e => setNewPkgTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={tr("VD: Bộ 100 câu Trắc nghiệm Toán 10 - Chương 1")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">{tr("Bộ môn")}</label>
                  <select
                    value={newPkgSubject}
                    onChange={e => setNewPkgSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {subjects?.map((s: string) => (
                      <option key={s} value={s}>{tr(s)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">{tr("Mô tả ngắn (Không bắt buộc)")}</label>
                  <textarea
                    value={newPkgDesc}
                    onChange={e => setNewPkgDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={tr("Nhập mô tả về nội dung gói câu hỏi...")}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatePkgOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                  >
                    {tr("Hủy")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPkg}
                    className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4" /> {isSavingPkg ? tr("Đang lưu...") : tr("Tạo Gói Câu Hỏi")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Delete Package Confirmation */}
      <AnimatePresence>
        {deletingPkgId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingPkgId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{tr("Xóa Gói Câu Hỏi Này?")}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {tr("Toàn bộ câu hỏi nằm trong gói này sẽ bị xóa khỏi Supabase.")}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPkgId(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  {tr("Hủy bỏ")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeletePackage}
                  disabled={isDeletingPkg}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> {isDeletingPkg ? tr("Đang xóa...") : tr("Xóa Gói")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add/Edit Single Question inside Package */}
      <AnimatePresence>
        {isAddQuestionOpen && activePackage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddQuestionOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  {editingQuestion ? tr("Sửa Câu Hỏi Trong Gói") : tr("Thêm Câu Hỏi Mới Vào Gói")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestionSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">{tr("Nội dung câu hỏi / Đề bài")}</label>
                  <textarea
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={tr("Nhập đề bài câu hỏi...")}
                  />
                </div>

                {/* Ảnh minh họa cho đề bài (biểu đồ, hình vẽ, bài toán thực tế...) */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">
                    {tr("Ảnh minh họa")} <span className="text-slate-400 font-bold normal-case">{tr("(không bắt buộc)")}</span>
                  </label>

                  <input
                    ref={questionImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePickQuestionImage}
                    className="hidden"
                  />

                  {qImageUrl ? (
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qImageUrl}
                        alt={tr("Ảnh minh họa câu hỏi")}
                        className="max-h-56 w-auto mx-auto rounded-xl object-contain"
                      />
                      <div className="flex items-center justify-center gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => questionImageInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          {tr("Đổi ảnh khác")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQImageUrl(null)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                        >
                          {tr("Gỡ ảnh")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => questionImageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors disabled:opacity-60"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ImagePlus className="w-5 h-5" />
                      )}
                      <span className="text-xs font-extrabold">
                        {isUploadingImage ? tr("Đang tải ảnh lên...") : tr("Tải ảnh lên cho đề bài")}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{tr("PNG, JPG, WEBP — tối đa 5MB")}</span>
                    </button>
                  )}

                  {imageError && (
                    <p className="text-[11px] font-bold text-rose-600">{imageError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{tr("Đáp án A")}</label>
                    <input type="text" value={qOptA} onChange={e => setQOptA(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" placeholder={tr("Lựa chọn A...")} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{tr("Đáp án B")}</label>
                    <input type="text" value={qOptB} onChange={e => setQOptB(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" placeholder={tr("Lựa chọn B...")} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{tr("Đáp án C")}</label>
                    <input type="text" value={qOptC} onChange={e => setQOptC(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" placeholder={tr("Lựa chọn C...")} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{tr("Đáp án D")}</label>
                    <input type="text" value={qOptD} onChange={e => setQOptD(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" placeholder={tr("Lựa chọn D...")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">{tr("Đáp án ĐÚNG")}</label>
                    <select value={qCorrect} onChange={e => setQCorrect(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold">
                      <option value="A">{tr("Đáp án A")}</option>
                      <option value="B">{tr("Đáp án B")}</option>
                      <option value="C">{tr("Đáp án C")}</option>
                      <option value="D">{tr("Đáp án D")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">{tr("Mức độ nhận thức")}</label>
                    <select value={qLevel} onChange={e => setQLevel(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold">
                      <option value="l1">{tr("Nhận biết (Dễ)")}</option>
                      <option value="l2">{tr("Thông hiểu (Trung bình)")}</option>
                      <option value="l3">{tr("Vận dụng (Khó)")}</option>
                      <option value="l4">{tr("Vận dụng cao (Rất khó)")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">{tr("Lời giải chi tiết")}</label>
                  <textarea
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
                    placeholder={tr("Giải thích lý do chọn đáp án đúng...")}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddQuestionOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                  >
                    {tr("Hủy")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuestion || isUploadingImage}
                    className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isSavingQuestion ? tr("Đang lưu...") : isUploadingImage ? tr("Đang tải ảnh...") : tr("Lưu Câu Hỏi")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

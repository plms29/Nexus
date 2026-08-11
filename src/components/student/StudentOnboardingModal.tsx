'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, School, GraduationCap, ArrowRight, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useStore, StudentProfile } from '@/store/useStore';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AVATAR_OPTIONS = [
  { id: 'av1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4', label: 'Nam sinh 1' },
  { id: 'av2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=c0aede', label: 'Nữ sinh 1' },
  { id: 'av3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Callie&backgroundColor=ffdfbf', label: 'Năng nổ' },
  { id: 'av4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zack&backgroundColor=d1d4f9', label: 'Sáng tạo' },
  { id: 'av5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia&backgroundColor=ffd5dc', label: 'Nữ sinh 2' },
  { id: 'av6', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Milo&backgroundColor=c0aede', label: 'Vui vẻ' },
  { id: 'av7', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=b6e3f4', label: 'Nam sinh 2' },
  { id: 'av8', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nala&backgroundColor=ffdfbf', label: 'Công nghệ' },
];

const DEFAULT_AVATAR = AVATAR_OPTIONS[0].url;

// Regex for class formats: 10Ax, 10Bx, 10Cx, 10Dx, 10/x (and 11/12 equivalents)
const CLASS_FORMAT_REGEX = /^(10|11|12)([ABCD]\d+|\/\d+)$/i;

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { studentProfile, setStudentProfile } = useStore();

  const [name, setName] = useState(studentProfile.name || '');
  const [classId, setClassId] = useState(studentProfile.classId || '');
  const [school, setSchool] = useState(studentProfile.school || '');
  const [province, setProvince] = useState(studentProfile.province || '');
  const [avatar, setAvatar] = useState(studentProfile.avatar || DEFAULT_AVATAR);
  const [classError, setClassError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(studentProfile.name || '');
    setClassId(studentProfile.classId || '');
    setSchool(studentProfile.school || '');
    setProvince(studentProfile.province || '');
    setAvatar(studentProfile.avatar || DEFAULT_AVATAR);
    setClassError(null);
    setSaveError(null);
  }, [isOpen, studentProfile]);

  const activeAvatarUrl = (avatar && avatar.startsWith('http')) ? avatar : DEFAULT_AVATAR;

  if (!isOpen) return null;

  const handleClassChange = (val: string) => {
    setClassId(val);
    if (val.trim() && !CLASS_FORMAT_REGEX.test(val.trim())) {
      setClassError('Định dạng lớp không đúng! Hãy điền dạng 10Ax, 10Bx, 10Cx, 10Dx hoặc 10/x (VD: 10A5, 11B2, 12/1)');
    } else {
      setClassError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const trimmedClass = classId.trim().toUpperCase();
    if (!trimmedClass) {
      setClassError('Vui lòng nhập lớp học.');
      return;
    }
    if (!CLASS_FORMAT_REGEX.test(trimmedClass)) {
      setClassError('Định dạng lớp chưa hợp lệ! Ví dụ: 10A5, 11B2, 12/1');
      return;
    }
    if (!name.trim()) {
      setSaveError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!school.trim()) {
      setSaveError('Vui lòng nhập trường học.');
      return;
    }
    if (!province.trim()) {
      setSaveError('Vui lòng nhập tỉnh / thành phố.');
      return;
    }

    const updatedProfile: StudentProfile = {
      name: name.trim(),
      classId: trimmedClass,
      school: school.trim(),
      province: province.trim(),
      avatar: activeAvatarUrl,
      isOnboarded: true,
    };

    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

      const { saveStudentProfile } = await import('@/lib/api');
      await saveStudentProfile(user.id, updatedProfile);

      setStudentProfile(updatedProfile);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.';
      setSaveError(message);
      console.error('Failed to save student profile:', err);
    } finally {
      setSaving(false);
    }
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
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        >
          {/* Top Decorative Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm p-1 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                <img src={activeAvatarUrl} alt="Avatar 3D" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-blue-100 border border-white/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                  {studentProfile.isOnboarded ? 'Hồ Sơ Học Sinh' : 'Hồ Sơ Học Sinh Lần Đầu'}
                </span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">
                  Chỉnh Sửa Hồ Sơ & Đổi Lớp Học
                </h2>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/50">
            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}
            {/* Avatar Selector with Vibrant 3D Avatars */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2.5">
                Chân Dung Avatar 3D:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatar(av.url)}
                    className={clsx(
                      "w-12 h-12 rounded-2xl p-1 transition-all border flex items-center justify-center bg-white shadow-2xs overflow-hidden cursor-pointer",
                      avatar === av.url
                        ? "border-blue-600 ring-2 ring-blue-500 shadow-md scale-110"
                        : "border-slate-200 hover:border-slate-300 hover:scale-105"
                    )}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Họ và Tên Học Sinh:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Học"
                className="w-full px-4 py-3 rounded-2xl border text-sm font-extrabold shadow-2xs transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Class Input */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Lớp Học (Ví dụ: 10A5, 10A1, 11B2, 12A5):
                </span>
              </label>
              <input
                type="text"
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                placeholder="Ví dụ: 10A5, 11B2, 12/1"
                className={clsx(
                  "w-full px-4 py-3 rounded-2xl border text-sm font-extrabold uppercase shadow-2xs transition-all bg-white border-slate-200 focus:outline-none",
                  classError
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
                    : "focus:ring-2 focus:ring-indigo-500"
                )}
              />
              {classError && (
                <div className="text-[11px] font-extrabold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{classError}</span>
                </div>
              )}
            </div>

            {/* Grid 2 Cols: School & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-purple-600" />
                  Trường Học:
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ví dụ: THPT Chuyên Lê Quý Đôn"
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-extrabold shadow-2xs transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Tỉnh / Thành Phố:
                </label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Ví dụ: Đà Nẵng"
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-extrabold shadow-2xs transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span>Lưu Hồ Sơ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="px-5 py-3.5 rounded-2xl font-black text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all cursor-pointer disabled:opacity-70"
              >
                Đóng
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

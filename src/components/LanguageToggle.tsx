'use client';

import { Languages } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/lib/i18n';

interface LanguageToggleProps {
  className?: string;
  /** 'light' cho nền sáng, 'dark' cho nền tối (trang login, footer). */
  tone?: 'light' | 'dark';
  /** Ẩn nhãn chữ trên màn hình hẹp. */
  compact?: boolean;
}

/**
 * Nút đổi ngôn ngữ Việt <-> Anh. Hiển thị ngôn ngữ sẽ chuyển sang khi bấm.
 */
export function LanguageToggle({ className, tone = 'light', compact = true }: LanguageToggleProps) {
  const lang = useLanguage((s) => s.lang);
  const toggleLang = useLanguage((s) => s.toggleLang);

  const nextLang = lang === 'vi' ? 'en' : 'vi';
  const label = lang === 'vi' ? 'English' : 'Tiếng Việt';

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      title={label}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border shrink-0',
        tone === 'dark'
          ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/20'
          : 'text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-200',
        className
      )}
    >
      <Languages className="w-4 h-4" />
      <span className={clsx(compact && 'hidden sm:inline')}>{label}</span>
      <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{nextLang}</span>
    </button>
  );
}

export default LanguageToggle;

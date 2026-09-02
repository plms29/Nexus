'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { vi } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { EN } from './dictionary';

export type Lang = 'vi' | 'en';

const STORAGE_KEY = 'nexus_lang';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

// Server và lần render đầu ở client đều bắt đầu bằng 'vi' để tránh lệch hydration.
// LanguageSync đọc localStorage sau khi mount rồi mới đổi sang ngôn ngữ đã lưu.
export const useLanguage = create<LanguageState>((set, get) => ({
  lang: 'vi',
  setLang: (lang) => {
    set({ lang });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      } catch (e) {}
    }
  },
  toggleLang: () => get().setLang(get().lang === 'vi' ? 'en' : 'vi'),
}));

/** Gộp khoảng trắng để chuỗi JSX xuống dòng vẫn khớp key trong từ điển. */
function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

export function translate(text: string, lang: Lang): string {
  if (lang === 'vi') return text;
  const key = normalize(text);
  const hit = EN[key];
  if (hit === undefined) return text;
  // Giữ nguyên khoảng trắng đầu/cuối của chuỗi gốc (quan trọng với text JSX).
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return lead + hit + trail;
}

/**
 * Hàm dịch dùng trong component. Key là chính chuỗi tiếng Việt, nên khi thiếu
 * bản dịch thì UI vẫn hiển thị tiếng Việt thay vì trống.
 */
export function useTranslate() {
  const lang = useLanguage((s) => s.lang);
  return useCallback((text: string) => translate(text, lang), [lang]);
}

/** Locale cho date-fns theo ngôn ngữ đang chọn. */
export function useDateLocale() {
  const lang = useLanguage((s) => s.lang);
  return lang === 'en' ? enUS : vi;
}

/** Đọc ngôn ngữ đã lưu sau khi mount. Đặt một lần trong root layout. */
export function LanguageSync() {
  const setLang = useLanguage((s) => s.setLang);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'vi') setLang(saved);
      else document.documentElement.lang = 'vi';
    } catch (e) {}
  }, [setLang]);
  return null;
}

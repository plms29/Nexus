import { EN } from './dictionary';

export type Lang = 'vi' | 'en';

/** Gộp khoảng trắng để chuỗi JSX xuống dòng vẫn khớp key trong từ điển. */
function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Dịch một chuỗi tiếng Việt sang ngôn ngữ đang chọn.
 * Không có trong từ điển thì trả về nguyên văn, nên UI không bao giờ bị trống.
 * Hàm thuần nên dùng được cả ở route handler phía server.
 */
export function translate(text: string, lang: Lang): string {
  if (lang === 'vi' || !text) return text;
  const key = normalize(text);
  const hit = EN[key];
  if (hit === undefined) return text;
  // Giữ nguyên khoảng trắng đầu/cuối của chuỗi gốc (quan trọng với text JSX).
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return lead + hit + trail;
}

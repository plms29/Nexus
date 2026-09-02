import { EN } from './dictionary';
import { EN_DATA } from './dataset';

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
  const hit = EN[key] ?? EN_DATA[key];
  if (hit === undefined) return text;
  // Giữ nguyên khoảng trắng đầu/cuối của chuỗi gốc (quan trọng với text JSX).
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return lead + hit + trail;
}

/**
 * Dịch một câu mẫu rồi thay các chỗ trống `{ten}` bằng giá trị thực.
 * Dùng cho các câu do engine sinh ra, vì trật tự từ tiếng Anh khác tiếng Việt
 * nên không thể ghép từng mảnh rời.
 */
export function fill(template: string, vars: Record<string, string | number>, lang: Lang): string {
  return translate(template, lang).replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

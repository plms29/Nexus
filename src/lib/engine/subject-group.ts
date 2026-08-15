import { SubjectGroup } from './types';

/**
 * Bỏ dấu tiếng Việt và chuẩn hóa về chữ thường để so khớp tên môn học
 * bất kể giáo viên nhập "Vật lý", "vat ly" hay "VẬT LÝ".
 */
const normalizeSubjectName = (subject?: string | null): string =>
  (subject || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

// Từ khóa nhận diện môn thuộc ban tự nhiên (Toán, Lý, Hóa, Sinh, Tin, Công nghệ)
const NATURAL_KEYWORDS = ['toan', 'ly', 'vat ly', 'hoa', 'sinh', 'tin', 'cong nghe'];

// Từ khóa nhận diện môn thuộc ban xã hội (Văn, Sử, Địa, Ngoại ngữ, GDKT&PL)
const SOCIAL_KEYWORDS = [
  'van', 'ngu van', 'su', 'lich su', 'dia', 'anh', 'tieng anh', 'english',
  'ktpl', 'gdkt', 'gdcd', 'kinh te', 'phap luat', 'giao duc cong dan', 'ngoai ngu',
];

/**
 * Xác định môn học thuộc ban tự nhiên hay xã hội.
 * Dùng để ghi đúng subject_group cho mỗi mục workmap, phục vụ kiểm tra tỷ lệ 70/30 theo tuần.
 * @param subject Tên môn học do giáo viên chọn (ví dụ: "Ngữ văn", "Vật lý")
 * @returns 'natural' hoặc 'social'; mặc định 'natural' nếu không nhận diện được
 */
export const getSubjectGroup = (subject?: string | null): SubjectGroup => {
  const name = normalizeSubjectName(subject);
  if (!name) return 'natural';

  // So khớp từ khóa dài trước để "lich su" không bị "ly" cắt ngang
  const matchesKeyword = (keywords: string[]) =>
    [...keywords]
      .sort((a, b) => b.length - a.length)
      .some(keyword => name === keyword || name.includes(keyword));

  if (matchesKeyword(SOCIAL_KEYWORDS)) return 'social';
  if (matchesKeyword(NATURAL_KEYWORDS)) return 'natural';
  return 'natural';
};

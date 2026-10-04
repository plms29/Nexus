import { normalizeClassId } from './class-utils';

export interface ClassRoster {
  classId: string;
  homeroomTeacher: string;
  /** Tên học sinh theo thứ tự chỗ ngồi trên sơ đồ lớp */
  students: string[];
}

/**
 * Danh sách lớp dùng để chia nhóm khi giáo viên chuyển bài sang làm nhóm.
 * Lớp 12/22 lấy nguyên văn từ sơ đồ lớp (51 học sinh, GVCN Nguyễn Thị Hồng Đức).
 * Tài khoản student@school.com đứng tên "Minh Khoa" để học sinh demo thấy được nhóm của mình.
 */
const CLASS_ROSTERS: Record<string, ClassRoster> = {
  '12/22': {
    classId: '12/22',
    homeroomTeacher: 'Nguyễn Thị Hồng Đức',
    students: [
      'Gia Bảo', 'Bảo An', 'Cát Tường', 'Bảo Trân', 'Ánh Dương',
      'Bảo Khanh', 'Xuân Thu', 'Trần Vũ', 'Gia Linh', 'Hà An',
      'Thuỷ Tiên', 'Thiên Di', 'Đức Hoàng', 'Phúc Khánh', 'Khắc Hiếu',
      'Minh Khoa', 'Bảo Anh', 'Bảo Ngọc', 'Đoàn Phạm', 'Nhật Huy',
      'Bảo Châu', 'Hồng Phúc', 'Gia Như', 'Trung Hải', 'Uyên Phương',
      'Nam Khánh', 'Gia Huy', 'Thanh Nhã', 'Hoàng Nguyên', 'Kỳ Duyên',
      'Trần Gia Linh', 'Hữu Huân', 'Nguyễn Phan', 'Minh Hiếu', 'Tùng Sơn',
      'Thùy Linh', 'Thùy Nhi', 'Phú Đức', 'Phú Khánh', 'Đức Hải',
      'Hoàng Minh Hiếu', 'Lương Vy', 'Hoàng Oanh', 'Liên Chi', 'Đan Quỳnh',
      'Phương Tú', 'Khánh Phương', 'Trí Minh', 'Hồ Nhật Huy', 'Đan Thi',
      'Hạnh Nguyên',
    ],
  },
};

export function getClassRoster(classId?: string | null): ClassRoster | null {
  return CLASS_ROSTERS[normalizeClassId(classId)] ?? null;
}

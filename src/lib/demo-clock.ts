import { isSameDay } from 'date-fns';

/**
 * Đồng hồ của ứng dụng. Bản demo KHKT trình bày trên lịch cố định của lớp 12/22
 * (06/09 - 18/09/2026), nên "hôm nay" mặc định là 08:00 thứ Hai 07/09/2026 và vẫn chạy
 * tiếp theo thời gian thực kể từ lúc mở trang (để luật giao bài sau 19:00 không bị kích hoạt).
 *
 * Đổi mốc bằng biến môi trường NEXT_PUBLIC_DEMO_NOW (ví dụ "2026-09-14T08:00:00"),
 * đặt NEXT_PUBLIC_DEMO_NOW=off để dùng giờ thật.
 */
const DEMO_NOW = process.env.NEXT_PUBLIC_DEMO_NOW || '2026-09-07T08:00:00';

const offsetMs = DEMO_NOW === 'off' ? 0 : new Date(DEMO_NOW).getTime() - Date.now();

/** Thời điểm hiện tại theo đồng hồ demo */
export const now = (): Date => new Date(Date.now() + offsetMs);

/** Ngày có phải "hôm nay" theo đồng hồ demo hay không */
export const isDemoToday = (date: Date): boolean => isSameDay(date, now());

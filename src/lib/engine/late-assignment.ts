import { format, addDays, parseISO, isBefore } from 'date-fns';
import { fill, type Lang } from '../i18n/translate';

/** Sau giờ này thì ngày hôm đó coi như đã hết quỹ thời gian tự học của học sinh */
export const LATE_ASSIGNMENT_HOUR = 19;

export interface LateAssignmentCheck {
  /** Giáo viên đang giao bài sau 19:00 */
  isLate: boolean;
  /** Ngày sớm nhất còn xếp được việc cho học sinh */
  earliestWorkDate: string;
  /** Hạn nộp hiện tại rơi vào vùng quá gấp so với ngày bắt đầu hợp lệ */
  isDeadlineTooTight: boolean;
  /** Hạn nộp tối thiểu nên đặt để học sinh có ít nhất một ngày trọn vẹn */
  suggestedDeadline: string;
  reason: string;
}

/**
 * Áp luật "giao bài quá muộn" của tài liệu: nếu giáo viên bấm giao sau 19:00 thì
 * ngày hôm đó không còn là ngày làm bài hợp lệ, mọi việc phải đẩy sang ngày kế tiếp.
 * Muốn giữ hạn gấp hơn thì giáo viên phải nhập lý do (ghi vào audit log).
 *
 * @param startDate Ngày giao dự kiến (yyyy-MM-dd)
 * @param deadline Hạn nộp dự kiến (yyyy-MM-dd)
 * @param now Thời điểm hiện tại, truyền vào để kiểm thử được
 */
export const checkLateAssignment = (
  startDate: string,
  deadline: string,
  now: Date = new Date(),
  lang: Lang = 'vi'
): LateAssignmentCheck => {
  const today = format(now, 'yyyy-MM-dd');
  const isLate = now.getHours() >= LATE_ASSIGNMENT_HOUR;

  // Chỉ đẩy lịch khi bài được giao cho chính hôm nay; giao trước cho ngày mai thì không ảnh hưởng
  const startsToday = startDate <= today;
  const earliestWorkDate = isLate && startsToday
    ? format(addDays(parseISO(today), 1), 'yyyy-MM-dd')
    : (startDate > today ? startDate : today);

  const suggestedDeadline = earliestWorkDate;
  const isDeadlineTooTight = isBefore(parseISO(deadline), parseISO(earliestWorkDate));

  let reason = '';
  if (isLate && startsToday) {
    reason = isDeadlineTooTight
      ? fill(
          'Bài được giao sau {hour}:00 nên hôm nay ({today}) không còn là ngày làm bài hợp lệ, mà hạn nộp lại là {deadline}. Học sinh không còn ngày nào để làm bài.',
          { hour: LATE_ASSIGNMENT_HOUR, today, deadline },
          lang
        )
      : fill(
          'Bài được giao sau {hour}:00 nên hôm nay ({today}) đã hết quỹ thời gian tự học. Lịch làm bài bắt đầu từ {start}.',
          { hour: LATE_ASSIGNMENT_HOUR, today, start: earliestWorkDate },
          lang
        );
  } else if (isDeadlineTooTight) {
    reason = fill(
      'Hạn nộp {deadline} sớm hơn ngày bắt đầu làm bài {start}.',
      { deadline, start: earliestWorkDate },
      lang
    );
  }

  return { isLate: isLate && startsToday, earliestWorkDate, isDeadlineTooTight, suggestedDeadline, reason };
};

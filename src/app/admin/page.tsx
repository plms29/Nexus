'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, Clock, LogOut, BookOpen, Filter, RefreshCw,
  AlertTriangle, CalendarDays, User, Layers
} from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { fetchAuditLogs } from '@/lib/api';
import { AuditLog } from '@/lib/engine/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    fetchAuditLogs().then(data => {
      if (cancelled) return;
      setLogs(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const availableClasses = useMemo(
    () => [...new Set(logs.map(l => l.class_id).filter(Boolean))] as string[],
    [logs]
  );

  const filteredLogs = useMemo(
    () => logs.filter(l => {
      if (filterClass !== 'all' && l.class_id !== filterClass) return false;
      if (filterSeverity !== 'all' && l.severity !== filterSeverity) return false;
      return true;
    }),
    [logs, filterClass, filterSeverity]
  );

  const criticalCount = logs.filter(l => l.severity === 'critical').length;

  const formatTimestamp = (ts?: string) => {
    if (!ts) return '—';
    try {
      return format(parseISO(ts), 'HH:mm dd/MM/yyyy');
    } catch {
      return ts;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
              Bảng Điều Khiển Nhà Trường
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
              Giám sát các trường hợp giáo viên ghi đè cảnh báo quá tải học sinh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLogs}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Tải lại</span>
          </button>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5">
        {/* Thẻ tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Tổng lượt ghi đè
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">{logs.length}</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">
              Mức nghiêm trọng
            </div>
            <div className="text-3xl font-black text-rose-600 mt-1 flex items-center gap-2">
              {criticalCount}
              {criticalCount > 0 && <ShieldAlert className="w-6 h-6 text-rose-500" />}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Vượt trên 30 phút hoặc giao gấp sau 19:00
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Số lớp bị ảnh hưởng
            </div>
            <div className="text-3xl font-black text-indigo-600 mt-1">{availableClasses.length}</div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" /> Lọc
          </span>

          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Tất cả lớp</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>Lớp {c}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Mọi mức độ</option>
            <option value="critical">Nghiêm trọng</option>
            <option value="soft">Nhẹ</option>
          </select>
        </div>

        {/* Danh sách nhật ký */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-sm font-semibold text-slate-500">
            Đang tải nhật ký...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Chưa có lượt ghi đè nào</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              {logs.length === 0
                ? 'Chưa giáo viên nào phải ghi đè cảnh báo quá tải. Đây là dấu hiệu tốt.'
                : 'Không có bản ghi nào khớp bộ lọc đã chọn.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className={clsx(
                  'bg-white rounded-2xl p-5 border shadow-2xs',
                  log.severity === 'critical' ? 'border-rose-200' : 'border-amber-200'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm',
                      log.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
                    )}>
                      {log.severity === 'critical'
                        ? <ShieldAlert className="w-5 h-5" />
                        : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-sm text-slate-900">{log.task_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          Lớp {log.class_id || '—'}
                        </span>
                        <span>•</span>
                        <span>Môn {log.subject_id || '—'}</span>
                        {log.teacher_name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {log.teacher_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={clsx(
                    'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 h-fit',
                    log.severity === 'critical'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}>
                    {log.severity === 'critical' ? 'Nghiêm trọng' : 'Nhẹ'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    <span className="font-extrabold text-slate-900">Lý do giáo viên nêu: </span>
                    {log.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Ghi lúc {formatTimestamp(log.timestamp)}
                    </span>
                    {log.deadline && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        Hạn nộp {log.deadline}
                      </span>
                    )}
                    {log.excess_minutes != null && log.excess_minutes > 0 && (
                      <span className="text-rose-600">
                        Vượt {log.excess_minutes} phút so với ngưỡng 5 LU/ngày
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

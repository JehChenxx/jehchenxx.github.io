import supabase from './client';

export type VisitCounts = { total: number; daily: number };
export type DailyVisitRow = { date: string; count: number };

const STAMP_KEY = 'visit_count_stamp';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// RETURNS TABLE 的 RPC 返回数组，取第一行
const firstRow = (data: any): VisitCounts | null => {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { total: row.total ?? 0, daily: row.daily ?? 0 };
};

/** 读取当前计数（不自增） */
export const getVisitCounts = async (): Promise<VisitCounts | null> => {
  const { data, error } = await supabase.rpc('get_visit_count');
  if (error) {
    console.error('get_visit_count failed:', error);
    return null;
  }
  return firstRow(data);
};

/** 自增并返回最新计数 */
export const incrementVisitCount = async (): Promise<VisitCounts | null> => {
  const { data, error } = await supabase.rpc('increment_visit_count');
  if (error) {
    console.error('increment_visit_count failed:', error);
    return null;
  }
  return firstRow(data);
};

/** 记录一次访问：同一浏览器 24h 内只自增一次，之后只读取最新值 */
export const trackVisit = async (): Promise<VisitCounts | null> => {
  const lastStamp = Number(localStorage.getItem(STAMP_KEY) ?? 0);
  if (Date.now() - lastStamp < TWENTY_FOUR_HOURS) {
    return getVisitCounts();
  }
  const counts = await incrementVisitCount();
  if (counts) {
    localStorage.setItem(STAMP_KEY, String(Date.now()));
  }
  return counts;
};

/** 近 N 天每日访问数，缺失日期补 0 */
export const getDailyVisitHistory = async (
  days: number,
): Promise<DailyVisitRow[]> => {
  const { data, error } = await supabase.rpc('get_daily_visit_history', {
    days,
  });
  if (error) {
    console.error('get_daily_visit_history failed:', error);
    return [];
  }
  const map = new Map<string, number>(
    (Array.isArray(data) ? data : []).map((r: any) => [
      r.visit_date,
      r.visit_count,
    ]),
  );
  const out: DailyVisitRow[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
};

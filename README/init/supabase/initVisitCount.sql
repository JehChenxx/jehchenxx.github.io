-- ============================================================
-- 访问计数：单表 + RLS + RPC（幂等，可反复执行）
--
-- 单表 site_stats，key 区分计数类型：
--   'total'                → 历史总访问人次
--   'daily_YYYY-MM-DD'     → 当日访问人次（自动按日滚动）
-- ============================================================

-- 清理旧对象（幂等：不存在就跳过）
DROP TABLE IF EXISTS site_stats;
DROP FUNCTION IF EXISTS increment_visit_count();
DROP FUNCTION IF EXISTS get_visit_count();
DROP FUNCTION IF EXISTS get_daily_visit_history();                 -- 旧签名
DROP FUNCTION IF EXISTS get_daily_visit_history(INTEGER);          -- 当前签名

-- 建表
CREATE TABLE site_stats (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- 预置 total 行（第一次访问时 daily_ 行由 RPC 自动 upsert）
INSERT INTO site_stats (key, count) VALUES ('total', 0) ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny anon direct access" ON site_stats;
CREATE POLICY "Deny anon direct access"
  ON site_stats FOR ALL
  USING (false);

-- 自增（同时 +total 和当日），返回 (total, daily)
CREATE FUNCTION increment_visit_count()
RETURNS TABLE(total INTEGER, daily INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO site_stats (key, count) VALUES ('total', 1)
  ON CONFLICT (key) DO UPDATE SET count = site_stats.count + 1
  RETURNING count INTO total;

  INSERT INTO site_stats (key, count) VALUES ('daily_' || current_date::text, 1)
  ON CONFLICT (key) DO UPDATE SET count = site_stats.count + 1
  RETURNING count INTO daily;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_visit_count() TO anon;

-- 读取（一次 RPC 同时拿到 total 和 daily）
CREATE FUNCTION get_visit_count()
RETURNS TABLE(total INTEGER, daily INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  SELECT count INTO total FROM site_stats WHERE key = 'total';
  SELECT count INTO daily FROM site_stats WHERE key = 'daily_' || current_date::text;
  total := COALESCE(total, 0);
  daily := COALESCE(daily, 0);
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION get_visit_count() TO anon;

-- 最近 N 天每日访问（按日期升序），返回 (visit_date TEXT, visit_count INTEGER)
CREATE FUNCTION get_daily_visit_history(days INTEGER DEFAULT 30)
RETURNS TABLE(visit_date TEXT, visit_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    substr(site_stats.key, 7)::text AS visit_date,
    site_stats.count                AS visit_count
  FROM site_stats
  WHERE site_stats.key LIKE 'daily_%'
    AND site_stats.key >= 'daily_' || (current_date - (days - 1))::text
  ORDER BY site_stats.key;
END;
$$;

GRANT EXECUTE ON FUNCTION get_daily_visit_history(INTEGER) TO anon;

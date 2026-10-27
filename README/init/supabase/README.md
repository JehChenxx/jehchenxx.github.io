# Supabase 使用经验

本项目用 Supabase（免费计划）做：邮箱认证（`auth`）+ 访问计数（RPC）。代码统一收在 `src/supabase/`：`client.ts` 是客户端单例，`visitStats.ts` 是访问计数 API，页面不直接调 `supabase.rpc`。

## 1. 访问计数的数据库设计

单表 `site_stats`，用 `key` 区分维度：

| key | 含义 |
|---|---|
| `total` | 历史总人次 |
| `daily_YYYY-MM-DD` | 当日人次（每天自动新增一行） |

配套 3 个 RPC（均 `SECURITY DEFINER`，anon 只能调函数、不能直接读写表）：

- `increment_visit_count()` → 返回 `(total, daily)`，两行原子 upsert
- `get_visit_count()` → 返回 `(total, daily)`，只读
- `get_daily_visit_history(days INTEGER)` → 返回近 N 天 `(visit_date, visit_count)`

## 2. 安全模式：RLS + SECURITY DEFINER

```sql
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny anon direct access" ON site_stats FOR ALL USING (false);

CREATE FUNCTION ... SECURITY DEFINER ...;
GRANT EXECUTE ON FUNCTION xxx TO anon;
```

表对 anon 全拒，业务逻辑收敛在函数里，前端只持有 publishable key 也安全。

## 3. PL/pgSQL 踩过的坑

1. **`CREATE OR REPLACE FUNCTION` 不能改返回类型** → 先 `DROP FUNCTION IF EXISTS xxx(参数类型);` 再 `CREATE`。
2. **OUT 列名别用保留字/类型名**：`date` 会让 PostgREST 400。改用 `visit_date` 这类名字。
3. **OUT 列名别和表列同名**：函数里 `count` 会和 `site_stats.count` 歧义（42702）。OUT 列叫 `visit_count`，SELECT 时 `s.count AS visit_count`。
4. **RETURNS TABLE 的 RPC，前端 `data` 是数组**，取 `data[0]`。

## 4. 幂等初始化脚本

脚本要可反复执行：`DROP ... IF EXISTS` 开头 + `CREATE`（函数改返回类型后必须如此），表用 `CREATE TABLE IF NOT EXISTS`，初始数据用 `INSERT ... ON CONFLICT DO NOTHING`，策略用 `DROP POLICY IF EXISTS` + `CREATE POLICY`。

## 5. 前端约定

- 所有访问计数 RPC 统一走 `@/supabase/visitStats`，页面不直接调 `supabase.rpc`。
- 24h 防刷在 `trackVisit()` 里用 localStorage 时间戳实现：同一浏览器 24h 内只 `increment` 一次，之后只 `get`，保证多标签页/多浏览器数据一致。

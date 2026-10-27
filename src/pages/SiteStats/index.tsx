import supabase from '@/supabase/client';
import {
  ArrowUpOutlined,
  EyeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Statistic } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'umi';

const DAYS = 30;

type DailyRow = { date: string; count: number };

const fillMissingDates = (rows: DailyRow[], days: number): DailyRow[] => {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const out: DailyRow[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
};

const SiteStats = () => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [daily, setDaily] = useState(0);
  const [history, setHistory] = useState<DailyRow[]>([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [countRes, histRes] = await Promise.all([
        supabase.rpc('get_visit_count'),
        supabase.rpc('get_daily_visit_history', { days: DAYS }),
      ]);
      const countRow = Array.isArray(countRes.data)
        ? countRes.data[0]
        : (countRes.data as any);
      if (countRow) {
        setTotal(countRow.total ?? 0);
        setDaily(countRow.daily ?? 0);
      }
      const list: DailyRow[] = Array.isArray(histRes.data)
        ? histRes.data.map((r: any) => ({
            date: r.visit_date,
            count: r.visit_count,
          }))
        : [];
      setHistory(fillMissingDates(list, DAYS));
    } catch (err) {
      console.error('site stats rpc failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 24, bottom: 36 },
    xAxis: {
      type: 'category',
      data: history.map((r) => r.date.slice(5)),
      axisLabel: { rotate: 45, fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: formatMessage({ id: 'siteStatus.dailyVisitCount' }),
        type: 'bar',
        data: history.map((r) => r.count),
        itemStyle: { color: '#1677ff', borderRadius: [3, 3, 0, 0] },
      },
    ],
  };

  const cumulative = (() => {
    let sum = 0;
    return history.map((r) => {
      sum += r.count;
      return sum;
    });
  })();

  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 16, top: 24, bottom: 36 },
    xAxis: {
      type: 'category',
      data: history.map((r) => r.date.slice(5)),
      axisLabel: { rotate: 45, fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: formatMessage({ id: 'siteStatus.visitCount' }),
        type: 'line',
        data: cumulative,
        smooth: true,
        areaStyle: { opacity: 0.15 },
        lineStyle: { color: '#52c41a', width: 2 },
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  return (
    <div style={{ padding: 24, position: 'relative' }}>
      <Row justify="end">
        <Col>
          <Button
            type="text"
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchStats}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card
            variant="borderless"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff' }}>
                  {formatMessage({ id: 'siteStatus.dailyVisitCount' })}
                </span>
              }
              value={daily}
              prefix={<ThunderboltOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 600 }}
              suffix={
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                  {formatMessage({ id: 'siteStatus.visitCount' })
                    .split('：')[0]
                    .includes('Total')
                    ? 'times'
                    : '次'}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            variant="borderless"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff' }}>
                  {formatMessage({ id: 'siteStatus.visitCount' })}
                </span>
              }
              value={total}
              prefix={<ArrowUpOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            loading={loading}
            title={formatMessage({ id: 'siteStatus.dailyVisitCount' })}
            extra={<EyeOutlined />}
          >
            <ReactECharts option={barOption} style={{ height: 320 }} notMerge />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            loading={loading}
            title={formatMessage({ id: 'siteStatus.visitCount' })}
            extra={<ArrowUpOutlined />}
          >
            <ReactECharts
              option={lineOption}
              style={{ height: 320 }}
              notMerge
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SiteStats;

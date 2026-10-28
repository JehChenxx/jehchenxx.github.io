import {
  getDailyVisitHistory,
  getVisitCounts,
  type DailyVisitRow,
} from '@/supabase/visitStats';
import {
  ArrowUpOutlined,
  EyeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Spin, Statistic } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'umi';

const DAYS = 14;

const SiteStats = () => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [daily, setDaily] = useState(0);
  const [history, setHistory] = useState<DailyVisitRow[]>([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const [counts, list] = await Promise.all([
      getVisitCounts(),
      getDailyVisitHistory(DAYS),
    ]);
    if (counts) {
      setTotal(counts.total);
      setDaily(counts.daily);
    }
    setHistory(list);
    setLoading(false);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Row justify="end">
        <Col>
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchStats}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
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
      <Row gutter={[16, 16]} style={{ flex: 1, minHeight: 0 }}>
        <Col xs={24} lg={12} style={{ height: '100%' }}>
          <Card
            title={formatMessage({ id: 'siteStatus.dailyVisitCount' })}
            extra={<EyeOutlined />}
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 57px)', padding: 16 }}
          >
            <ReactECharts
              option={barOption}
              style={{ height: '100%' }}
              notMerge
              autoResize
            />
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ height: '100%' }}>
          <Card
            title={formatMessage({ id: 'siteStatus.visitCount' })}
            extra={<ArrowUpOutlined />}
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 57px)', padding: 16 }}
          >
            <ReactECharts
              option={lineOption}
              style={{ height: '100%' }}
              notMerge
              autoResize
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SiteStats;

import { CalculatorOutlined, NumberOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  InputNumber,
  List,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CombinationResult {
  sum: number;
  diff: number;
  combinations: number[][];
}

const SubsetSumCalculator: React.FC = () => {
  const [rawData, setRawData] = useState<string>(
    '10, 22, 5, 7, 2, 32, 43, 31, 57, 3, 2, 99, 54, 3, 67, 33, 546, 1, 3, 8, 54, 3, 3, 23, 6, 6',
  );
  const [goal, setGoal] = useState<number>(725);
  const [topN, setTopN] = useState<number>(10);
  const [maxCombo, setMaxCombo] = useState<number>(5);
  const [results, setResults] = useState<CombinationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      const arr = rawData
        .split(/[,\s\n，]+/)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);

      // --- 修改点 1: 使用 Map 代替数组以支持小数 key ---
      const dp = new Map<number, number[][]>();
      const dpSets = new Map<number, Set<string>>();

      // 初始化 0 的情况
      dp.set(0, [[]]);
      dpSets.set(0, new Set<string>(['']));

      const possibleSums = new Set<number>([0]);

      for (const num of arr) {
        // 这里的 currentSums 需要包含当前已经发现的所有和
        const currentSums = Array.from(possibleSums).sort((a, b) => b - a);

        for (const s of currentSums) {
          // 使用精度处理，防止 JS 浮点数计算误差（如 0.1 + 0.2 !== 0.3）
          const newSum = parseFloat((s + num).toFixed(10));

          if (newSum <= goal) {
            const currentDpS = dp.get(s) || [];

            for (const existing of currentDpS) {
              const newCombo = [...existing, num].sort((a, b) => a - b);
              const fingerprint = newCombo.join(',');

              // 初始化新和的容器
              if (!dp.has(newSum)) {
                dp.set(newSum, []);
                dpSets.set(newSum, new Set<string>());
              }

              const targetDp = dp.get(newSum)!;
              const targetSet = dpSets.get(newSum)!;

              if (targetDp.length < maxCombo) {
                if (!targetSet.has(fingerprint)) {
                  targetDp.push(newCombo);
                  targetSet.add(fingerprint);
                  possibleSums.add(newSum);
                }
              } else {
                break;
              }
            }
          }
        }
      }

      const finalResults: CombinationResult[] = Array.from(possibleSums)
        .filter((s) => s > 0)
        .map((s) => ({
          sum: s,
          diff: parseFloat((goal - s).toFixed(10)), // 同样处理精度
          combinations: dp.get(s) || [],
        }))
        .sort((a, b) => a.diff - b.diff || b.sum - a.sum)
        .slice(0, topN);

      setResults(finalResults);
      setLoading(false);
    }, 50);
  };

  return (
    <Card
      title={
        <>
          <CalculatorOutlined /> 小于等于最接近计算器
        </>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>待选数字集合(空格/中文逗号/英文逗号分隔):</Text>
          <TextArea
            rows={4}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="请输入数字，支持逗号、空格或换行分隔"
          />
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Text strong>目标预期 (Goal):</Text>
            <InputNumber
              min={1}
              value={goal}
              onChange={(v) => setGoal(v || 0)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Text strong>结果方案数 (TopN):</Text>
            <InputNumber
              min={1}
              value={topN}
              onChange={(v) => setTopN(v || 1)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Text strong>每种金额最大组合数:</Text>
            <InputNumber
              min={1}
              value={maxCombo}
              onChange={(v) => setMaxCombo(v || 1)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
        <Button
          type="primary"
          size="large"
          onClick={handleCalculate}
          loading={loading}
          block
        >
          开始分析最佳组合
        </Button>
        <Divider orientation="left">计算结果 (小于等于预期值)</Divider>
        {results.length > 0 ? (
          <List
            dataSource={results}
            renderItem={(item, index) => (
              <Card
                title={
                  <Space>
                    方案 {index + 1}
                    <Tag color="blue">差距: {item.diff}</Tag>
                    <Tag color="green" icon={<NumberOutlined />}>
                      总和: {item.sum}
                    </Tag>
                  </Space>
                }
              >
                {item.combinations.map((combo, cIdx) => (
                  <div key={cIdx}>
                    <Text type="secondary">#{cIdx + 1}</Text>
                    <Divider type="vertical"></Divider>
                    {combo.join(' + ')}
                  </div>
                ))}
              </Card>
            )}
          />
        ) : (
          <Empty description="暂无数据，请点击上方按钮开始计算" />
        )}
      </Space>
    </Card>
  );
};

export default SubsetSumCalculator;

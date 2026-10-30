import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';

const { Text } = Typography;
const { TextArea } = Input;

interface CombinationRow {
  sum: number;
  combo: number[];
}

interface CombinationResult {
  rows: CombinationRow[];
}

interface SolveGoalResult {
  sum: number;
  diff: number;
  combinations: number[][];
}

interface GoalResult {
  goal: number;
  results: CombinationResult[];
}

const parseNumbers = (text: string) =>
  text
    .split(/[,\s，]+/)
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

// 表格布局保证列对齐：边框仅作视觉分隔，复制时浏览器自动用制表符分隔单元格
const resultTableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  fontFamily: 'Consolas, Menlo, monospace',
};
const resultCellStyle: React.CSSProperties = {
  padding: '2px 12px',
  textAlign: 'left',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
};
const resultGoalCellStyle: React.CSSProperties = {
  ...resultCellStyle,
  borderLeft: '1px solid #f0f0f0',
};

const SubsetSumCalculator: React.FC = () => {
  const intl = useIntl();
  const [rawData, setRawData] = useState<string>(
    '1，2，3，4，5，6，7，8，9，10，20，30，40，50，60，70，80，90，100，200，300，400，500，600，700，800',
  );
  const [goalInput, setGoalInput] = useState<string>('725，21，42，63');
  const [topN, setTopN] = useState<number>(10);
  const [maxCombo, setMaxCombo] = useState<number>(5);
  const [results, setResults] = useState<GoalResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCalculate = () => {
    // 保留目标值的输入顺序，第一个目标优先满足
    const goals = Array.from(new Set(parseNumbers(goalInput)));
    if (!goals.length) {
      setResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const arr = parseNumbers(rawData).sort((a, b) => a - b);

      // 在项池上求不超过 goal 的可行和，同一和最多保留 limit 个不重复组合（按 diff 升序）
      const solveGoal = (
        pool: number[],
        goal: number,
        limit: number,
      ): SolveGoalResult[] => {
        const combosBySum = new Map<number, number[][]>();
        const fingerprints = new Map<number, Set<string>>();
        combosBySum.set(0, [[]]);
        fingerprints.set(0, new Set<string>(['']));

        for (const num of pool) {
          // 快照上一轮可达的和并降序处理：新和恒大于来源和，先处理可避免本轮重复使用同一数值
          const sums = Array.from(combosBySum.keys()).sort((a, b) => b - a);
          for (const s of sums) {
            // 精度处理，防止浮点误差（如 0.1 + 0.2 !== 0.3）
            const newSum = parseFloat((s + num).toFixed(10));
            if (newSum > goal) continue;
            if (!combosBySum.has(newSum)) {
              combosBySum.set(newSum, []);
              fingerprints.set(newSum, new Set<string>());
            }
            const targetCombos = combosBySum.get(newSum)!;
            const targetMarks = fingerprints.get(newSum)!;
            for (const existing of combosBySum.get(s)!) {
              if (targetCombos.length >= limit) break;
              const newCombo = [...existing, num].sort((a, b) => a - b);
              const mark = newCombo.join(',');
              if (targetMarks.has(mark)) continue;
              targetCombos.push(newCombo);
              targetMarks.add(mark);
            }
          }
        }

        return Array.from(combosBySum.entries())
          .filter(([sum]) => sum > 0 && sum <= goal)
          .map(([sum, combinations]) => ({
            sum,
            diff: parseFloat((goal - sum).toFixed(10)),
            combinations,
          }))
          .sort((a, b) => a.diff - b.diff || b.sum - a.sum);
      };

      // 按多重集从项池中扣除已使用的项
      const consume = (pool: number[], combo: number[]) => {
        const next = [...pool];
        for (const n of combo) {
          const idx = next.indexOf(n);
          if (idx >= 0) next.splice(idx, 1);
        }
        return next;
      };

      const finalResults: GoalResult[] = goals.map((g) => ({
        goal: g,
        results: [],
      }));
      // 第一个目标的档位游标：方案序号越大，接近度和必须更小
      let prevRootSum = Infinity;

      for (let planIdx = 0; planIdx < topN; planIdx++) {
        // 方案由第一个目标的接近度档位决定，它的每个实现对应方案里的一行
        const root = solveGoal(arr, goals[0], maxCombo).find(
          (c) => c.sum < prevRootSum,
        );
        prevRootSum = root ? root.sum : 0;

        const cells: CombinationResult[] = goals.map(() => ({ rows: [] }));

        if (root) {
          for (const rootCombo of root.combinations) {
            // 一行 = 一次完整分配：前一目标用掉的数值，后续目标不能再用
            let pool = consume(arr, rootCombo);
            cells[0].rows.push({ sum: root.sum, combo: rootCombo });

            for (let gIdx = 1; gIdx < goals.length; gIdx++) {
              // 目标按输入顺序优先，行内直接取剩余池里最接近的组合
              const picked = solveGoal(pool, goals[gIdx], maxCombo)[0];
              if (!picked) {
                // 该行下这个目标没有可用组合，补 0 与其它目标对齐
                cells[gIdx].rows.push({ sum: 0, combo: [0] });
                continue;
              }
              const combo = picked.combinations[0] || [];
              pool = consume(pool, combo);
              cells[gIdx].rows.push({ sum: picked.sum, combo });
            }
          }
        }

        goals.forEach((_, gIdx) => {
          finalResults[gIdx].results[planIdx] = cells[gIdx];
        });
      }

      setResults(finalResults);
      setLoading(false);
    }, 50);
  };

  return (
    <Card>
      <Row gutter={24}>
        <Col span={12}>
          <Text strong>
            {intl.formatMessage({ id: 'tools.rawData.label' })}:
          </Text>
          <TextArea
            rows={3}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder={intl.formatMessage({
              id: 'tools.rawData.placeholder',
            })}
          />
        </Col>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={24}>
              <Text strong>
                {intl.formatMessage({ id: 'tools.goal.label' })}（
                {intl.formatMessage({ id: 'tools.goal.hint' })}）:
              </Text>
              <Input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'tools.goal.placeholder',
                })}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Text strong>
                {intl.formatMessage({ id: 'tools.topN.label' })}:
              </Text>
              <InputNumber
                min={1}
                value={topN}
                onChange={(v) => setTopN(v || 1)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Text strong>
                {intl.formatMessage({ id: 'tools.maxCombo.label' })}:
              </Text>
              <InputNumber
                min={1}
                value={maxCombo}
                onChange={(v) => setMaxCombo(v || 1)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Text strong>&nbsp;</Text>
              <Button
                type="primary"
                onClick={handleCalculate}
                loading={loading}
                block
              >
                {intl.formatMessage({ id: 'tools.calculate' })}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider titlePlacement="start">
        {intl.formatMessage({ id: 'tools.result.title' })}
      </Divider>
      {results.length > 0 ? (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {Array.from({ length: topN }, (_, rankIdx) => {
            const cells = results.map((group) => group.results[rankIdx]);
            const maxRows = Math.max(
              0,
              ...cells.map((cell) => (cell ? cell.rows.length : 0)),
            );
            // 完全无组合时只提示一次，避免 topN 张相同的空卡片
            if (maxRows === 0) {
              return rankIdx === 0 ? (
                <Card key={rankIdx} size="small">
                  <Text type="secondary">
                    {intl.formatMessage({ id: 'tools.result.noMatch' })}
                  </Text>
                </Card>
              ) : null;
            }

            return (
              <Card
                key={rankIdx}
                size="small"
                style={{ width: '100%' }}
                styles={{ body: { overflowX: 'auto' } }}
              >
                <table style={resultTableStyle}>
                  <thead>
                    <tr>
                      <th style={resultCellStyle} />
                      {results.map((group, gIdx) => (
                        <th
                          key={group.goal}
                          style={
                            gIdx > 0 ? resultGoalCellStyle : resultCellStyle
                          }
                        >
                          <Tag color="orange">
                            {intl.formatMessage(
                              { id: 'tools.result.goal' },
                              { goal: group.goal },
                            )}
                          </Tag>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxRows }, (_, rowIdx) => (
                      <tr key={rowIdx}>
                        <td style={resultCellStyle}>
                          <Text type="secondary">#{rowIdx + 1}</Text>
                        </td>
                        {results.map((group, gIdx) => {
                          const row = cells[gIdx]?.rows[rowIdx];
                          return (
                            <td
                              key={group.goal}
                              style={
                                gIdx > 0 ? resultGoalCellStyle : resultCellStyle
                              }
                            >
                              {!row ? null : row.sum <= 0 ? (
                                <Text type="secondary">0</Text>
                              ) : (
                                <>
                                  {row.combo.join(' + ')} = {row.sum}
                                  <Text type="secondary">
                                    （
                                    {intl.formatMessage(
                                      { id: 'tools.result.diff' },
                                      {
                                        diff: parseFloat(
                                          (group.goal - row.sum).toFixed(10),
                                        ),
                                      },
                                    )}
                                    ）
                                  </Text>
                                </>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            );
          })}
        </Space>
      ) : (
        <Empty description={intl.formatMessage({ id: 'tools.empty' })} />
      )}
    </Card>
  );
};

export default SubsetSumCalculator;

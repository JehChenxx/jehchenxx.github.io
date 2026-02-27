import { Tabs } from 'antd/lib';
import React from 'react';
import SubsetSumCalculator from './SubsetSumCalculator';

const Index = () => {
  return (
    <Tabs
      items={[
        {
          label: '小于等于最接近计算器',
          key: 'subsetSumCalculator',
          children: <SubsetSumCalculator></SubsetSumCalculator>,
        },
      ]}
    ></Tabs>
  );
};

export default React.memo(Index);

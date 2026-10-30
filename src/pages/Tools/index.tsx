import { Tabs } from 'antd';
import React from 'react';
import { useIntl } from 'umi';
import SubsetSumCalculator from './SubsetSumCalculator';

const Index = () => {
  const intl = useIntl();
  return (
    <Tabs
      items={[
        {
          label: intl.formatMessage({
            id: 'tools.lessThanEqualToNearestCalculator',
          }),
          key: 'subsetSumCalculator',
          children: <SubsetSumCalculator></SubsetSumCalculator>,
        },
      ]}
    ></Tabs>
  );
};

export default React.memo(Index);

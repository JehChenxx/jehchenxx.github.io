import { getDataAPIkey } from '@/layouts/MongoDBAltasKey';
import { Empty, notification, Table } from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

const Index = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      axios
        .post(
          '/mongo/api/data/v1/action/find',
          {
            collection: 'users',
            database: 'sample_mflix',
            dataSource: 'JehChenxx',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Request-Headers': '*',
              'api-key': getDataAPIkey(),
            },
          },
        )
        .then(({ data }) => setData(data.documents));
    } catch {
      notification.error({ message: '查询失败' });
    }
  }, []);

  return (
    <>
      {isEmpty(data) ? (
        <Empty></Empty>
      ) : (
        <Table dataSource={data}>
          <Column title="_id" dataIndex="_id" key="_id" />
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="email" dataIndex="email" key="email" />
          <Column title="password" dataIndex="password" key="password" />
        </Table>
      )}
    </>
  );
};

export default Index;

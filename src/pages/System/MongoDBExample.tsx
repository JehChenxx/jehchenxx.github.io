import { findUrl, getAccesToken } from '@/utils/mongodb';
import { Button, Modal, Table, notification } from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { useEffect, useState } from 'react';

const MongoDBExample = () => {
  const [showExample, setShowExample] = useState(false);
  const [exampleData, setExampleData] = useState([]);

  const searchExampleData = () => {
    axios
      .post(
        findUrl,
        {
          collection: 'users',
          database: 'sample_mflix',
          dataSource: 'JehChenxx',
        },
        { headers: { Authorization: `Bearer ${getAccesToken()}` } },
      )
      .then(({ data }) => setExampleData(data.documents))
      .catch(() => notification.error({ message: '查询失败' }));
  };

  useEffect(() => {
    searchExampleData();
  }, [showExample]);

  return (
    <>
      <Button onClick={() => setShowExample(true)}>数据库示例数据</Button>
      <Modal
        width="80vw"
        open={showExample}
        onCancel={() => setShowExample(false)}
        title="数据库示例数据"
        footer={null}
      >
        <Table rowKey="_id" dataSource={exampleData}>
          <Column title="_id" dataIndex="_id" key="_id" />
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="email" dataIndex="email" key="email" />
          <Column title="password" dataIndex="password" key="password" />
        </Table>
      </Modal>
    </>
  );
};

export default MongoDBExample;

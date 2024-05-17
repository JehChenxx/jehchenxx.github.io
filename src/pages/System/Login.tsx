import { Button, Card, Form, Input, notification, Table } from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { ACCESS_TOKEN, findUrl, loginUrl, setAccesToken } from './mongodb';

interface ValueType {
  username: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm<ValueType>();

  const [exampleData, setExampleData] = useState([]);

  const searchExampleData = (accessToken: string) => {
    axios
      .post(
        findUrl,
        {
          collection: 'users',
          database: 'sample_mflix',
          dataSource: 'JehChenxx',
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      .then(({ data }) => setExampleData(data.documents))
      .catch(() => notification.error({ message: '查询失败' }));
  };

  const login = (values: ValueType) => {
    axios
      .post(loginUrl, values)
      .then((response) => {
        setAccesToken(response.data[ACCESS_TOKEN]);
        searchExampleData(response.data[ACCESS_TOKEN]);
      })
      .catch(() => notification.error({ message: '登陆失败' }));
  };

  return (
    <>
      <Form name="login" form={form} onFinish={login}>
        <Form.Item required label="用户名/邮箱" name="username">
          <Input allowClear></Input>
        </Form.Item>
        <Form.Item required label="密码" name="password">
          <Input allowClear></Input>
        </Form.Item>
        <Button type="primary" htmlType="submit">
          确定
        </Button>
      </Form>
      {!isEmpty(exampleData) && (
        <Card title="数据库示例数据">
          <Table rowKey="_id" dataSource={exampleData}>
            <Column title="_id" dataIndex="_id" key="_id" />
            <Column title="Name" dataIndex="name" key="name" />
            <Column title="email" dataIndex="email" key="email" />
            <Column title="password" dataIndex="password" key="password" />
          </Table>
        </Card>
      )}
    </>
  );
};

export default Login;

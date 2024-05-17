import { ACCESS_TOKEN, getUser, loginUrl, setUser } from '@/utils/mongodb';
import { Button, Card, Form, Input, notification } from 'antd';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { history } from 'umi';

interface ValueType {
  username: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm<ValueType>();

  useEffect(() => {
    const user = getUser();
    if (!isEmpty(user)) {
      history.push('/');
    }
  }, []);

  const login = (values: ValueType) => {
    axios
      .post(loginUrl, values)
      .then((response) => {
        setUser(values.username, response.data[ACCESS_TOKEN]);
      })
      .catch(() => notification.error({ message: '登陆失败' }));
  };

  return (
    <div
      style={{ width: 512, position: 'absolute', top: '30vh', right: '30vw' }}
    >
      <Card title="欢迎登录">
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          name="login"
          form={form}
          onFinish={login}
        >
          <Form.Item required label="用户名/邮箱" name="username">
            <Input allowClear></Input>
          </Form.Item>
          <Form.Item required label="密码" name="password">
            <Input allowClear></Input>
          </Form.Item>
          <div style={{ float: 'right' }}>
            <Button onClick={() => form.resetFields()}>重置</Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

import supabase from '@/supabase/client';
import { UserOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useIntl, useModel } from 'umi';

const AccountPage = () => {
  const intl = useIntl();
  const { user } = useModel('user');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [usernameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    usernameForm.setFieldsValue({
      username: user.user_metadata?.username || '',
    });
  }, [user, usernameForm]);

  if (!user) return null;

  const handleUsername = async (values: { username: string }) => {
    const trimmed = values.username.trim();
    if (!trimmed) return;
    setUsernameLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: trimmed },
      });
      if (error) throw error;
      message.success(intl.formatMessage({ id: 'account.usernameUpdated' }));
    } catch (err: any) {
      message.error(err?.message || 'Unknown error');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(intl.formatMessage({ id: 'account.passwordMismatch' }));
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      if (error) throw error;
      message.success(intl.formatMessage({ id: 'account.passwordUpdated' }));
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err?.message || 'Unknown error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isOauth = !!user.app_metadata?.providers?.some(
    (p: string) => p !== 'email',
  );

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : '-';

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 16px' }}>
      <Typography.Title level={3}>
        {intl.formatMessage({ id: 'account.title' })}
      </Typography.Title>

      {isOauth && (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          showIcon
          message={intl.formatMessage({ id: 'account.oauthHint' })}
        />
      )}

      <Card
        title={intl.formatMessage({ id: 'account.basicInfo' })}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item
            label={intl.formatMessage({ id: 'account.email' })}
          >
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'account.userId' })}
          >
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'account.createdAt' })}
          >
            {formatDate(user.created_at)}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'account.lastSignIn' })}
          >
            {formatDate(user.last_sign_in_at)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={intl.formatMessage({ id: 'account.changeUsername' })}
        style={{ marginBottom: 16 }}
      >
        <Form
          form={usernameForm}
          layout="vertical"
          onFinish={handleUsername}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'auth.usernameRequired' }),
              },
              {
                min: 2,
                max: 32,
                message: intl.formatMessage({ id: 'auth.usernameRange' }),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={intl.formatMessage({ id: 'auth.username' })}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={usernameLoading}>
              {intl.formatMessage({ id: 'app.save' })}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {!isOauth && (
        <Card title={intl.formatMessage({ id: 'account.changePassword' })}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePassword}
            requiredMark={false}
          >
            <Form.Item
              name="newPassword"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: intl.formatMessage({ id: 'auth.passwordMin' }),
                },
              ]}
            >
              <Input.Password
                placeholder={intl.formatMessage({
                  id: 'account.newPassword',
                })}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'account.confirmPasswordRequired',
                  }),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        intl.formatMessage({
                          id: 'account.passwordMismatch',
                        }),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={intl.formatMessage({
                  id: 'account.confirmPassword',
                })}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
              >
                {intl.formatMessage({ id: 'app.save' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default React.memo(AccountPage);

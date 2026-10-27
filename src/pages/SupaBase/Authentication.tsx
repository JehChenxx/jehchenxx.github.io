import supabase from '@/supabase/client';
import { GithubOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Spin, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useIntl } from 'umi';

type AuthView =
  | 'sign_in'
  | 'sign_up'
  | 'forgotten_password'
  | 'update_password';

const PROVIDER = 'GitHub';
const REDIRECT_URL = `${window.location.origin}/login`;

const Authentication = () => {
  const intl = useIntl();
  const [view, setView] = useState<AuthView>('sign_in');
  const [submitting, setSubmitting] = useState(false);
  const [socialRedirecting, setSocialRedirecting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const hash = window.location.hash;
    const url = new URL(
      hash.startsWith('#') ? hash.slice(1) : hash,
      window.location.origin,
    );
    const type = url.searchParams.get('type');
    if (type === 'recovery') {
      setView('update_password');
    }
  }, []);

  useEffect(() => {
    const isRecovery = () => {
      const hash = window.location.hash;
      const url = new URL(
        hash.startsWith('#') ? hash.slice(1) : hash,
        window.location.origin,
      );
      return url.searchParams.get('type') === 'recovery';
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session && !isRecovery()) {
          history.push('/home');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (values: { email: string; password?: string }) => {
    setSubmitting(true);
    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password!,
        });
        if (error) throw error;
      } else if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password!,
        });
        if (error) throw error;
        message.success(
          intl.formatMessage({
            id: 'app.auth.confirmation',
            defaultMessage: '注册成功，请查收验证邮件',
          }),
        );
      } else if (view === 'forgotten_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.email,
          { redirectTo: REDIRECT_URL },
        );
        if (error) throw error;
        message.success(
          intl.formatMessage({
            id: 'app.auth.sentResetLink',
            defaultMessage: '重置链接已发送，请查收邮件',
          }),
        );
      } else if (view === 'update_password') {
        const { error } = await supabase.auth.updateUser({
          password: values.password!,
        });
        if (error) throw error;
        message.success(
          intl.formatMessage({
            id: 'app.auth.passwordUpdated',
            defaultMessage: '密码已更新',
          }),
        );
        setView('sign_in');
        form.resetFields();
      }
    } catch (err: any) {
      message.error(err?.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGitHub = async () => {
    setSocialRedirecting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: REDIRECT_URL },
      });
      if (error) throw error;
      // 这里不 reset，OAuth 会立刻跳转，让 loading 保持到页面离开
    } catch (err: any) {
      setSocialRedirecting(false);
      message.error(err?.message || 'Unknown error');
    }
  };

  const switchView = (next: AuthView) => {
    if (submitting || socialRedirecting) return;
    setView(next);
    form.resetFields();
  };

  const i18n = (id: string, defaultMessage?: string) =>
    intl.formatMessage({ id, defaultMessage });

  const showEmail = view !== 'update_password';
  const showPassword =
    view === 'sign_in' || view === 'sign_up' || view === 'update_password';

  const disabled = submitting || socialRedirecting;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Spin
        spinning={socialRedirecting}
        tip={intl.formatMessage({
          id: 'app.auth.redirecting',
          defaultMessage: '正在跳转...',
        })}
      >
        <div style={{ width: 380, padding: '24px' }}>
          <Typography.Title level={3} style={{ textAlign: 'center' }}>
            {view === 'sign_in' && i18n('app.auth.signIn', '登录')}
            {view === 'sign_up' && i18n('app.auth.signUp', '注册')}
            {view === 'forgotten_password' &&
              i18n('app.auth.forgotPassword', '忘记密码')}
            {view === 'update_password' &&
              i18n('app.auth.updatePassword', '更新密码')}
          </Typography.Title>

          <Button
            block
            icon={<GithubOutlined />}
            loading={socialRedirecting}
            disabled={submitting}
            onClick={handleGitHub}
          >
            {view === 'sign_up'
              ? intl.formatMessage(
                  { id: 'app.auth.socialProviderSignUp' },
                  { provider: PROVIDER },
                )
              : intl.formatMessage(
                  { id: 'app.auth.socialProvider' },
                  { provider: PROVIDER },
                )}
          </Button>

          {view !== 'update_password' && (
            <Divider plain>
              {intl.formatMessage({
                id: 'app.auth.or',
                defaultMessage: '或使用邮箱',
              })}
            </Divider>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            disabled={disabled}
          >
            {showEmail && (
              <Form.Item
                name="email"
                rules={[
                  { required: true },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder={i18n('app.auth.email')}
                  autoComplete="email"
                />
              </Form.Item>
            )}

            {showPassword && (
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    min: 6,
                    message: i18n('app.auth.passwordMin', '密码至少 6 位'),
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={
                    view === 'update_password'
                      ? i18n('app.auth.newPassword')
                      : view === 'sign_up'
                      ? i18n('app.auth.createPassword')
                      : i18n('app.auth.password')
                  }
                  autoComplete={
                    view === 'sign_in' ? 'current-password' : 'new-password'
                  }
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={socialRedirecting}
              >
                {view === 'sign_in' && i18n('app.auth.signIn')}
                {view === 'sign_up' && i18n('app.auth.signUp')}
                {view === 'forgotten_password' &&
                  i18n('app.auth.sendResetLink')}
                {view === 'update_password' && i18n('app.auth.updatePassword')}
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {view === 'sign_in' && (
              <>
                <Button
                  type="link"
                  disabled={disabled}
                  onClick={() => switchView('forgotten_password')}
                >
                  {i18n('app.auth.forgotPassword')}
                </Button>
                <Button
                  type="link"
                  disabled={disabled}
                  onClick={() => switchView('sign_up')}
                >
                  {i18n('app.auth.noAccount')}
                </Button>
              </>
            )}
            {view === 'sign_up' && (
              <Button
                type="link"
                disabled={disabled}
                onClick={() => switchView('sign_in')}
              >
                {i18n('app.auth.alreadyHaveAccount')}
              </Button>
            )}
            {view === 'forgotten_password' && (
              <Button
                type="link"
                disabled={disabled}
                onClick={() => switchView('sign_in')}
              >
                {i18n('app.auth.backToSignIn', '返回登录')}
              </Button>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default React.memo(Authentication);

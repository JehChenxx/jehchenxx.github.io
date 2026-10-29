import supabase from '@/supabase/client';
import {
  GithubOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
  const [initializing, setInitializing] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    // mount 时同步处理三种入口状态，避免 OAuth 回调回来先闪表单再跳转
    const hash = window.location.hash;
    const url = new URL(
      hash.startsWith('#') ? hash.slice(1) : hash,
      window.location.origin,
    );
    const type = url.searchParams.get('type');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (type === 'recovery') {
        setView('update_password');
      } else if (session) {
        // OAuth / callback 回来 session 已经在了，直接走路由跳转，不等 onAuthStateChange
        history.push('/dashboard');
        return;
      }
      setInitializing(false);
    });
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
          history.push('/dashboard');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (values: {
    email: string;
    password?: string;
    username?: string;
  }) => {
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
          options: { data: { username: values.username?.trim() } },
        });
        if (error) throw error;
        message.success(intl.formatMessage({ id: 'auth.confirmation' }));
      } else if (view === 'forgotten_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.email,
          { redirectTo: REDIRECT_URL },
        );
        if (error) throw error;
        message.success(intl.formatMessage({ id: 'auth.sentResetLink' }));
      } else if (view === 'update_password') {
        const { error } = await supabase.auth.updateUser({
          password: values.password!,
        });
        if (error) throw error;
        message.success(intl.formatMessage({ id: 'auth.passwordUpdated' }));
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
    // 下一帧再触发跳转，让 overlay 先上屏
    requestAnimationFrame(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: REDIRECT_URL },
      });
      if (error) {
        message.error(error.message);
        setSocialRedirecting(false);
      }
    });
  };

  const switchView = (next: AuthView) => {
    if (submitting || socialRedirecting) return;
    setView(next);
    form.resetFields();
  };

  const i18n = (id: string) => intl.formatMessage({ id });

  const showEmail = view !== 'update_password';
  const showUsername = view === 'sign_up';
  const showPassword =
    view === 'sign_in' || view === 'sign_up' || view === 'update_password';

  const disabled = submitting || socialRedirecting;

  if (socialRedirecting || initializing) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        <Spin
          size="large"
          description={intl.formatMessage({
            id: socialRedirecting ? 'auth.redirecting' : 'auth.initializing',
          })}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <div style={{ width: 380, padding: '24px' }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          {view === 'sign_in' && i18n('auth.signIn')}
          {view === 'sign_up' && i18n('auth.signUp')}
          {view === 'forgotten_password' && i18n('auth.forgotPassword')}
          {view === 'update_password' && i18n('auth.updatePassword')}
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
                { id: 'auth.socialProviderSignUp' },
                { provider: PROVIDER },
              )
            : intl.formatMessage(
                { id: 'auth.socialProvider' },
                { provider: PROVIDER },
              )}
        </Button>

        {view !== 'update_password' && (
          <Divider plain>{i18n('auth.or')}</Divider>
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
                placeholder={i18n('auth.email')}
                autoComplete="email"
              />
            </Form.Item>
          )}

          {showUsername && (
            <Form.Item
              name="username"
              rules={[
                { required: true, message: i18n('auth.usernameRequired') },
                {
                  min: 2,
                  max: 32,
                  message: i18n('auth.usernameRange'),
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={i18n('auth.username')}
                autoComplete="username"
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
                  message: i18n('auth.passwordMin'),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={
                  view === 'update_password'
                    ? i18n('auth.newPassword')
                    : view === 'sign_up'
                    ? i18n('auth.createPassword')
                    : i18n('auth.password')
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
              {view === 'sign_in' && i18n('auth.signIn')}
              {view === 'sign_up' && i18n('auth.signUp')}
              {view === 'forgotten_password' && i18n('auth.sendResetLink')}
              {view === 'update_password' && i18n('auth.updatePassword')}
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
                {i18n('auth.forgotPassword')}
              </Button>
              <Button
                type="link"
                disabled={disabled}
                onClick={() => switchView('sign_up')}
              >
                {i18n('auth.noAccount')}
              </Button>
            </>
          )}
          {view === 'sign_up' && (
            <Button
              type="link"
              disabled={disabled}
              onClick={() => switchView('sign_in')}
            >
              {i18n('auth.alreadyHaveAccount')}
            </Button>
          )}
          {view === 'forgotten_password' && (
            <Button
              type="link"
              disabled={disabled}
              onClick={() => switchView('sign_in')}
            >
              {i18n('auth.backToSignIn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Authentication);

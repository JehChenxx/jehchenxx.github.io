import supabase from '@/utils/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import React, { useEffect } from 'react';
import { history } from 'umi';

const Authentication = () => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          history.push('/home');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <div style={{ width: '40vw', minWidth: 300 }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github']}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '登录',
                loading_button_label: '登录中...',
                social_provider_text: '使用 {{provider}} 账号登录',
                link_text: '已有账号？去登录',
              },
              sign_up: {
                email_label: '邮箱地址',
                password_label: '创建密码',
                button_label: '注册',
                loading_button_label: '注册中...',
                social_provider_text: '使用 {{provider}} 账号注册',
                link_text: '没有账号？去注册',
              },
              forgotten_password: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '发送重置链接',
                loading_button_label: '发送中...',
                link_text: '忘记密码？',
              },
              update_password: {
                password_label: '新密码',
                button_label: '更新密码',
                loading_button_label: '更新中...',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(Authentication);

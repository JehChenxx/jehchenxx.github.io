import React, { useEffect } from 'react';
import { useLocation } from 'umi';

const NotFoundPage: React.FC = () => {
  const location = useLocation();

  const getAuthError = () => {
    // 兼容 hash 路由下 Supabase 的错误回调 (例如 /#error=...)
    // location.pathname 在 umi 中通常以 / 开头，例如 "/error=access_denied&..."
    // 我们需要解析其中的参数
    const searchPart = location.pathname.startsWith('/')
      ? location.pathname.slice(1)
      : location.pathname;

    // 如果路径本身就是以 error= 开头的，说明是 Supabase 的 hash 回调
    if (searchPart.startsWith('error=')) {
      const params = new URLSearchParams(searchPart);
      return {
        error: params.get('error'),
        code: params.get('error_code'),
        description: params.get('error_description'),
      };
    }
    return null;
  };

  const authError = getAuthError();

  useEffect(() => {
    if (authError) {
      console.error('Authentication Error:', authError);
    } else {
      console.error(`404 Not Found: ${location.pathname}`);
    }
  }, [location.pathname, authError]);

  return (
    <div style={{ padding: '100px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '24px' }}>
        {authError ? '验证失败' : '404'}
      </h1>
      <p
        style={{
          fontSize: '20px',
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {authError
          ? decodeURIComponent(
              authError.description || '身份验证过程中发生错误',
            )
          : '抱歉，您访问的页面不存在。'}
      </p>
      {authError && authError.code && (
        <p style={{ marginTop: '8px', color: '#999' }}>
          错误代码: {authError.code}
        </p>
      )}
      {!authError && (
        <p style={{ marginTop: '16px', color: '#999' }}>
          当前路径: {location.pathname}
        </p>
      )}
      <div style={{ marginTop: '32px' }}>
        <a
          href={authError ? '/login' : '/'}
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            backgroundColor: '#1890ff',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          {authError ? '返回登录页' : '返回首页'}
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;

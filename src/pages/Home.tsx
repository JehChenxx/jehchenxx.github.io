import supabase from '@/utils/supabase';
import { User } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import SupaBaseExample from './System/SupaBaseExample';

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. 定义一个统一的处理函数
    const handleAuthState = (event, session) => {
      console.log('Auth Event:', event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 如果检测到退出，或者 session 为空，确保清理 URL 碎片
      if (event === 'SIGNED_OUT' || !session) {
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // 2. 初始化检查：直接用 getSession，它的速度比 getUser 快，且能直接拿到状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    // 3. 监听：这是最核心的，它会覆盖掉初始化的状态
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleAuthState(event, session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // 必须有空数组，防止组件渲染时反复执行 checkUser

  // 在你的 Home 页面（即退出按钮所在的页面）
  const handleSignOut = async () => {
    // 1. 彻底清除 Supabase 端的会话
    const { error } = await supabase.auth.signOut();

    if (!error) {
      console.log('退出成功，清理现场...');

      // 2. 清除 URL 中残留的 access_token，防止被 SDK 误认为回拨
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 3. 强制刷新式跳转，确保所有内存里的 SDK 状态重置
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', padding: '20px' }}>
      <div
        id="user"
        style={{
          marginBottom: '20px',
          padding: '10px',
          borderBottom: '1px solid #ccc',
        }}
      >
        {user ? (
          <div>
            <p>
              欢迎回来, <strong>{user.email}</strong>!
            </p>
            <SupaBaseExample></SupaBaseExample>
            <button onClick={handleSignOut}>退出登录</button>
          </div>
        ) : (
          <p>当前未登录，请点击右上角登录按钮进行登录。</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(Home);

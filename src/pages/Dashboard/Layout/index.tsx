import { ReloadOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, history, useIntl, useLocation, useModel } from 'umi';

const tabs = [
  { key: '/dashboard/home', localeId: 'menu.dashboard.home' },
  { key: '/dashboard/blog', localeId: 'menu.dashboard.blog' },
  { key: '/dashboard/account', localeId: 'menu.dashboard.account' },
];

// 纯 mask-image 实现"圆角矩形 + 四边 + 四角 全边缘渐隐虚化"
// 去掉 clip-path 硬切（硬切边缘无法被 mask 覆盖），8 层 intersect 后所有边缘平滑渐隐
const fadeMask =
  // 四边渐隐：距边缘 0% 透明 → 20% 全黑 → 100% 保持
  'linear-gradient(to top, transparent 0%, black 20%, black 100%),' +
  'linear-gradient(to bottom, transparent 0%, black 20%, black 100%),' +
  'linear-gradient(to right, transparent 0%, black 20%, black 100%),' +
  'linear-gradient(to left, transparent 0%, black 20%, black 100%),' +
  // 四角圆角补偿：从角点向外 0% 透明 → 10% 全黑 → 椭圆边缘 15% 保持
  // 与 linear-gradient intersect 后，四角形成渐隐圆角
  'radial-gradient(ellipse 15% 15% at top left, transparent 0%, black 10%, black 100%),' +
  'radial-gradient(ellipse 15% 15% at top right, transparent 0%, black 10%, black 100%),' +
  'radial-gradient(ellipse 15% 15% at bottom left, transparent 0%, black 10%, black 100%),' +
  'radial-gradient(ellipse 15% 15% at bottom right, transparent 0%, black 10%, black 100%)';

const DashboardLayout: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const { user, loading } = useModel('user');
  const [bgSeed, setBgSeed] = useState(() => Date.now());

  useEffect(() => {
    if (loading) return;
    if (!user) {
      history.push('/login');
      return;
    }
    if (location.pathname === '/dashboard') {
      history.replace('/dashboard/home');
    }
  }, [user, loading, location.pathname]);

  const activeKey = tabs.some((t) => location.pathname.startsWith(t.key))
    ? tabs.find((t) => location.pathname.startsWith(t.key))!.key
    : '/dashboard/home';

  const bgUrl = `https://picsum.photos/seed/${bgSeed}/1920/1080`;
  const bgOpacity = activeKey === '/dashboard/home' ? 1 : 0.55;

  if (loading || !user) return null;

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 背景层：纯 mask-image 实现圆角矩形 + 全边缘渐隐虚化，filter 做模糊 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: bgOpacity,
          filter: activeKey === '/dashboard/home' ? undefined : 'blur(6px)',
          zIndex: 0,
          pointerEvents: 'none',
          WebkitMaskImage: fadeMask,
          maskImage: fadeMask,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      />

      {/* 右上角悬浮文本按钮组 */}
      <Row justify="end">
        <Col>
          {tabs.map((t) => (
            <Button
              key={t.key}
              type={activeKey === t.key ? 'link' : 'text'}
              onClick={() => history.push(t.key)}
              style={{
                fontWeight: activeKey === t.key ? 600 : 400,
                paddingInline: 12,
              }}
            >
              {intl.formatMessage({ id: t.localeId })}
            </Button>
          ))}
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => setBgSeed(Date.now())}
            title={intl.formatMessage({ id: 'dashboard.refreshBg' })}
          />
        </Col>
      </Row>

      {/* 内容层：独立滚动，背景不跟着滚；隐藏滚动条 */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

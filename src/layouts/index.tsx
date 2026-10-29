import supabase from '@/supabase/client';
import { trackVisit } from '@/supabase/visitStats';
import Icon, {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  LoginOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { Avatar, ConfigProvider, Dropdown, Modal, Tooltip, theme } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  Outlet,
  SelectLang,
  history,
  useAppData,
  useIntl,
  useLocation,
  useModel,
} from 'umi';
import LogoPNG from './LogoPNG';

export default function Layout() {
  const { clientRoutes } = useAppData();
  const { formatMessage } = useIntl();
  const location = useLocation();

  const [isDark, setIsDark] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { user } = useModel('user');
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const hasTracked = useRef(false);

  const WELCOME_COUNT = 8;
  const welcomeIndex = useMemo(
    () => Math.floor(Math.random() * WELCOME_COUNT),
    [location.pathname],
  );

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    trackVisit().then((counts) => {
      if (counts) {
        setVisitCount(counts.total);
        setDailyCount(counts.daily);
      }
    });
  }, []);

  const algorithm = useMemo(
    () => [
      theme.defaultAlgorithm,
      ...(isDark ? [theme.darkAlgorithm] : []),
      ...(isCompact ? [theme.compactAlgorithm] : []),
    ],
    [isDark, isCompact],
  );

  const handleSignOut = useCallback(async () => {
    Modal.confirm({
      title: formatMessage({ id: 'app.logout.confirm' }),
      okText: formatMessage({ id: 'app.confirm' }),
      async onOk() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          window.location.href = '/login';
        }
      },
    });
  }, [formatMessage]);

  const filteredMenuData = useMemo(() => {
    if (user) return undefined;
    return (data: any[]) =>
      data.filter((item: any) => item.path !== '/dashboard');
  }, [user]);

  const route = useMemo(() => clientRoutes?.[0], [clientRoutes]);

  const onMenuHeaderClick = useCallback(() => history.push('/'), []);

  const actionsRender = useCallback(
    (props: any) => {
      if (props.isMobile) return [];
      return [
        props.layout !== 'side' && document.body.clientWidth > 1400
          ? user && formatMessage({ id: `app.welcome.${welcomeIndex}` })
          : undefined,
        user ? (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'account',
                  icon: <UserOutlined />,
                  label: formatMessage({ id: 'app.menu.account' }),
                  onClick: () => history.push('/dashboard/account'),
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: formatMessage({ id: 'app.logout' }),
                  onClick: handleSignOut,
                },
              ],
            }}
            trigger={['hover']}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Avatar size="small" shape="circle" style={{ cursor: 'pointer' }}>
                {(() => {
                  const name =
                    user?.user_metadata?.username ||
                    (user?.email ?? '').split('@')[0] ||
                    '?';
                  return name.charAt(0).toUpperCase();
                })()}
              </Avatar>
              {user?.user_metadata?.username ||
                (user?.email ?? '').split('@')[0] ||
                'tourist'}
            </span>
          </Dropdown>
        ) : (
          <Tooltip title={formatMessage({ id: 'app.login' })}>
            <LoginOutlined onClick={() => history.push('/login')} />
          </Tooltip>
        ),
        <SelectLang></SelectLang>,
        <Tooltip title={isDark ? 'Light' : 'Dark'}>
          {isDark ? (
            <SunOutlined onClick={() => setIsDark(false)} />
          ) : (
            <MoonOutlined onClick={() => setIsDark(true)} />
          )}
        </Tooltip>,
        <Tooltip title={isCompact ? 'Default' : 'Compact'}>
          {isCompact ? (
            <ColumnWidthOutlined onClick={() => setIsCompact(false)} />
          ) : (
            <ColumnHeightOutlined onClick={() => setIsCompact(true)} />
          )}
        </Tooltip>,
      ];
    },
    [user, formatMessage, welcomeIndex, handleSignOut, isDark, isCompact],
  );

  const menuItemRender = useCallback(
    (menuItemProps: any, defaultDom: any) => {
      if (menuItemProps.isUrl || menuItemProps.children) {
        return defaultDom;
      }
      if (menuItemProps.path && location.pathname !== menuItemProps.path) {
        return (
          <Link to={menuItemProps.path} target={menuItemProps.target}>
            {defaultDom}
          </Link>
        );
      }
      return defaultDom;
    },
    [location.pathname],
  );

  const menuFooterRender = useCallback(
    () => (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            fontSize: 'xx-small',
            color: '#8c8c8c',
          }}
        >
          {dailyCount != null &&
            formatMessage(
              { id: 'siteStatus.dailyVisitCount' },
              { count: dailyCount },
            )}
          <br></br>
          {visitCount != null &&
            formatMessage(
              { id: 'siteStatus.visitCount' },
              { count: visitCount },
            )}
        </div>
        <div>@J.C</div>
      </div>
    ),
    [dailyCount, visitCount, formatMessage],
  );

  const logo = useMemo(() => <Icon component={() => <LogoPNG />} />, []);

  return (
    <ConfigProvider theme={{ algorithm }}>
      <ProLayout
        formatMessage={formatMessage}
        menu={{ locale: true }}
        menuDataRender={filteredMenuData}
        layout="mix"
        logo={logo}
        title={formatMessage({ id: 'app.title' })}
        onMenuHeaderClick={onMenuHeaderClick}
        actionsRender={actionsRender}
        route={route}
        location={location}
        menuItemRender={menuItemRender}
        menuFooterRender={menuFooterRender}
      >
        <Outlet />
      </ProLayout>
    </ConfigProvider>
  );
}

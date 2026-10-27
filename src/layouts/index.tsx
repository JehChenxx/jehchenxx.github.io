import supabase from '@/utils/supabase';
import Icon, {
  BulbOutlined,
  BulbTwoTone,
  LoginOutlined,
  LogoutOutlined,
  SwitcherTwoTone,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { ConfigProvider, Popconfirm, Tooltip, theme } from 'antd';
import { createElement, useEffect, useState } from 'react';
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

  const [algorithm, setAlgorithm] = useState<number>(0);
  const { user } = useModel('user');
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [dailyCount, setDailyCount] = useState<number | null>(null);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const STAMP_KEY = 'visit_count_stamp';
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const run = async () => {
      const lastStamp = Number(localStorage.getItem(STAMP_KEY) ?? 0);
      const within24h = Date.now() - lastStamp < TWENTY_FOUR_HOURS;
      try {
        const rpc = within24h
          ? supabase.rpc('get_visit_count')
          : supabase.rpc('increment_visit_count');
        const { data } = await rpc;
        // RETURNS TABLE 模式下 data 是数组，取第一行
        const row = Array.isArray(data) ? data[0] : (data as any);
        if (row) {
          setVisitCount(row.total);
          setDailyCount(row.daily);
          if (!within24h) {
            localStorage.setItem(STAMP_KEY, String(Date.now()));
          }
        }
      } catch (err) {
        console.error('visit count rpc failed:', err);
      }
    };
    run();
  }, [location.pathname]);

  const algorithmList = [
    theme.defaultAlgorithm,
    theme.darkAlgorithm,
    theme.compactAlgorithm,
  ];
  const algorithmIconList = [BulbTwoTone, BulbOutlined, SwitcherTwoTone];

  const changeAlgotithm = () =>
    setAlgorithm((algorithm + 1) % algorithmList.length);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      console.log('退出成功，清理现场...');
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.location.href = '/login';
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: algorithmList[algorithm] }}>
      <ProLayout
        formatMessage={formatMessage}
        menu={{ locale: true }}
        layout="mix"
        logo={<Icon component={() => <LogoPNG />} />}
        title={formatMessage({ id: 'app.title' })}
        onMenuHeaderClick={() => history.push('/')}
        avatarProps={
          user
            ? { src: '/Logo.svg', size: 'small', title: user.email }
            : undefined
        }
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            props.layout !== 'side' && document.body.clientWidth > 1400
              ? user && (
                  <>
                    {formatMessage(
                      { id: 'app.welcome' },
                      { name: (user.email ?? '').split('@')[0] || 'tourist' },
                    )}
                  </>
                )
              : undefined,
            user ? (
              <Popconfirm
                title={formatMessage({ id: 'app.logout.confirm' })}
                onConfirm={handleSignOut}
              >
                <Tooltip title={formatMessage({ id: 'app.logout.' })}>
                  <LogoutOutlined />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip title={formatMessage({ id: 'app.login' })}>
                <LoginOutlined onClick={() => history.push('/login')} />
              </Tooltip>
            ),
            <SelectLang></SelectLang>,
            createElement(algorithmIconList[algorithm], {
              onClick: changeAlgotithm,
            }),
          ];
        }}
        route={clientRoutes[0]}
        location={location}
        menuItemRender={(menuItemProps, defaultDom) => {
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
        }}
        menuFooterRender={() => (
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
                formatMessage({ id: 'siteStatus.visitCount' }, { count: visitCount })}
            </div>
            <div>@JehChen</div>
          </div>
        )}
      >
        <Outlet />
      </ProLayout>
    </ConfigProvider>
  );
}

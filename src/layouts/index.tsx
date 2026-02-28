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
import { createElement, useState } from 'react';
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
import Logo from './Logo';

export default function Layout() {
  const { clientRoutes } = useAppData();
  const { formatMessage } = useIntl();
  const location = useLocation();

  const [algorithm, setAlgorithm] = useState<number>(0);
  const { user } = useModel('user');

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
        logo={<Icon component={() => <Logo></Logo>} />}
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
                      { name: (user.email ?? '').split('@')[0] },
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
        menuFooterRender={() => '@JehChen'}
      >
        <Outlet />
      </ProLayout>
    </ConfigProvider>
  );
}

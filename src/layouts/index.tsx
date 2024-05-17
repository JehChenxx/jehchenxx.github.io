import MongoDBExample from '@/pages/System/MongoDBExample';
import { User } from '@/types/User';
import { getUser, removeUser } from '@/utils/mongodb';
import Icon, {
  BulbOutlined,
  BulbTwoTone,
  LoginOutlined,
  LogoutOutlined,
  SwitcherTwoTone,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { ConfigProvider, Popconfirm, Tooltip, theme } from 'antd';
import { isNil } from 'lodash';
import { createElement, useEffect, useState } from 'react';
import { Link, Outlet, history, useAppData, useIntl, useLocation } from 'umi';
import Logo from './Logo';

export default function Layout() {
  const { clientRoutes } = useAppData();
  const { formatMessage } = useIntl();
  const location = useLocation();

  const [algorithm, setAlgorithm] = useState<number>(0);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const tmpUser = getUser();
    if (!isNil(tmpUser)) {
      setUser(tmpUser);
    }
  }, [getUser()]);

  const algorithmList = [
    theme.defaultAlgorithm,
    theme.darkAlgorithm,
    theme.compactAlgorithm,
  ];
  const algorithmIconList = [BulbTwoTone, BulbOutlined, SwitcherTwoTone];

  const changeAlgotithm = () =>
    setAlgorithm((algorithm + 1) % algorithmList.length);

  return (
    <ConfigProvider theme={{ algorithm: algorithmList[algorithm] }}>
      <ProLayout
        layout="mix"
        logo={<Icon component={() => <Logo></Logo>} />}
        title="Jeh"
        onMenuHeaderClick={() => history.push('/')}
        avatarProps={{ src: '/Logo.svg', size: 'small', title: user }}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            props.layout !== 'side' && document.body.clientWidth > 1400
              ? user && (
                  <>
                    {formatMessage({ id: 'user.welcome' }, { name: user })}
                    <MongoDBExample></MongoDBExample>
                  </>
                )
              : undefined,
            user ? (
              <Popconfirm
                title={formatMessage({ id: 'app.logout.confirm' })}
                onConfirm={removeUser}
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

import Icon, {
  BulbOutlined,
  BulbTwoTone,
  SwitcherTwoTone,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-layout';
import { ConfigProvider, Input, theme } from 'antd';
import { createElement, useState } from 'react';
import { Link, Outlet, useAppData, useLocation } from 'umi';
import Logo from './Logo';
import MongoDBAltasKey from './MongoDBAltasKey';

export default function Layout() {
  const { clientRoutes } = useAppData();
  const location = useLocation();

  const [algorithm, setAlgorithm] = useState<number>(0);

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
        title="JehChen"
        avatarProps={{ src: '/Logo.svg', size: 'small', title: 'Jeh' }}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            props.layout !== 'side' && document.body.clientWidth > 1400 ? (
              <Input></Input>
            ) : undefined,
            <MongoDBAltasKey></MongoDBAltasKey>,
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

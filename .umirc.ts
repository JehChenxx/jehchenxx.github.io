import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['@umijs/plugins/dist/locale', '@umijs/plugins/dist/react-query'],
  reactQuery: {},
  esbuildMinifyIIFE: true,
  locale: {
    default: 'zh-CN',
    antd: true,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },
  favicons: ['/Logo.svg'],
  history: { type: 'hash' },
  routes: [
    { path: '/', component: 'index', name: 'Index' },
    {
      path: '/login',
      component: 'System/Login',
      name: 'Login',
      hideInMenu: true,
    },
    {
      path: '/example',
      name: 'Example',
      routes: [
        {
          path: '/example/umi',
          name: 'umi',
          routes: [
            {
              path: '/example/umi/index',
              component: 'Example/umi/index',
              name: 'home',
            },
            {
              path: '/example/umi/docs',
              component: 'Example/umi/docs',
              name: 'docs',
            },
          ],
        },
        {
          path: '/example/antd',
          name: 'antd',
          routes: [
            {
              path: '/example/antd/products',
              component: 'Example/antd/products',
              name: 'products',
            },
          ],
        },
        {
          path: '/example/PinoyFreeCoder',
          name: 'PinoyFreeCoder',
          routes: [
            {
              path: '/example/PinoyFreeCoder/index',
              component: 'Example/PinoyFreeCoder/index',
              name: 'PinoyFreeCoder',
            },
          ],
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});

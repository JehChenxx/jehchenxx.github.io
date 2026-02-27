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
  publicPath: '/',
  base: '/',
  hash: true,
  exportStatic: {},
  history: { type: 'browser' },
  routes: [
    { path: '/', component: 'index', name: 'Index' },
    { path: '/home', component: 'Home', name: 'Home', hideInMenu: true },
    {
      path: '/login',
      component: 'SupaBase/Authentication',
      name: 'Login',
      hideInMenu: true,
    },
    {
      path: '/tools',
      component: 'Tools/index',
      name: 'Tools',
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
    { path: '/*', component: '404' },
  ],
  npmClient: 'pnpm',
});

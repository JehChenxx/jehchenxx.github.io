import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [
    '@umijs/plugins/dist/locale',
    // '@umijs/plugins/dist/layout',
    '@umijs/plugins/dist/model',
    '@umijs/plugins/dist/react-query',
  ],
  reactQuery: {},
  esbuildMinifyIIFE: true,
  locale: {
    default: 'zh-CN',
    antd: true,
    title: true,
    baseNavigator: true,
    baseSeparator: '-',
  },
  favicons: ['/Logo.svg'],
  publicPath: '/',
  base: '/',
  hash: true,
  exportStatic: {},
  history: { type: 'browser' },
  model: {},
  routes: [
    { path: '/', component: 'index', name: 'Index', locale: 'menu.index' },
    {
      path: '/home',
      component: 'Home',
      name: 'Home',
      hideInMenu: true,
      locale: 'menu.home',
    },
    {
      path: '/login',
      component: 'SupaBase/Authentication',
      name: 'Login',
      hideInMenu: true,
      locale: 'menu.login',
    },
    {
      path: '/tools',
      component: 'Tools/index',
      name: 'Tools',
      locale: 'menu.tools',
    },
    {
      path: '/example',
      name: 'Example',
      locale: 'menu.example',
      routes: [
        {
          path: '/example/umi',
          name: 'umi',
          locale: 'menu.example.umi',
          routes: [
            {
              path: '/example/umi/index',
              component: 'Example/umi/index',
              name: 'home',
              locale: 'menu.example.umi.home',
            },
            {
              path: '/example/umi/docs',
              component: 'Example/umi/docs',
              name: 'docs',
              locale: 'menu.example.umi.docs',
            },
          ],
        },
        {
          path: '/example/antd',
          name: 'antd',
          locale: 'menu.example.antd',
          routes: [
            {
              path: '/example/antd/products',
              component: 'Example/antd/products',
              name: 'products',
              locale: 'menu.example.antd.products',
            },
          ],
        },
        {
          path: '/example/PinoyFreeCoder',
          name: 'PinoyFreeCoder',
          locale: 'menu.example.PinoyFreeCoder',
          routes: [
            {
              path: '/example/PinoyFreeCoder/index',
              component: 'Example/PinoyFreeCoder/index',
              name: 'PinoyFreeCoder',
              locale: 'menu.example.PinoyFreeCoder.index',
            },
          ],
        },
      ],
    },
    { path: '/*', component: '404', locale: 'menu.404' },
  ],
  npmClient: 'pnpm',
});

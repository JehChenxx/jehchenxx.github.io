import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['@umijs/plugins/dist/react-query'],
  reactQuery: {},
  proxy: {
    '/mongo/api': {
      target:
        'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-erhzmlq/endpoint/',
      changeOrigin: true,
      pathRewrite: { '^/mongo/api': '' },
    },
  },
  routes: [
    { path: '/', component: 'index', name: 'Index' },
    {
      path: '/umi',
      name: 'umi',
      routes: [
        { path: '/umi/index', component: 'umi/index', name: 'home' },
        { path: '/umi/docs', component: 'umi/docs', name: 'docs' },
      ],
    },
    {
      path: '/antd',
      name: 'antd',
      routes: [
        { path: '/antd/products', component: 'products', name: 'products' },
      ],
    },
  ],
  npmClient: 'pnpm',
});

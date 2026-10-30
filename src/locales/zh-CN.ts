import account from './zh-CN/account';
import app from './zh-CN/app';
import auth from './zh-CN/auth';
import dashboard from './zh-CN/dashboard';
import menu from './zh-CN/menu';
import siteStatus from './zh-CN/siteStatus';
import tools from './zh-CN/tools';

export default {
  ...app,
  ...account,
  ...auth,
  ...dashboard,
  ...menu,
  ...siteStatus,
  ...tools,
};

import { history } from 'umi';

export const loginUrl =
  'https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-erhzmlq/auth/providers/local-userpass/login';

export const findUrl =
  'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-erhzmlq/endpoint/data/v1/action/find';

export const User = 'username';
export const ACCESS_TOKEN = 'access_token';

export const setAccesToken = (accesToken: string) =>
  sessionStorage.setItem(ACCESS_TOKEN, accesToken);

export const getAccesToken = () => sessionStorage.getItem(ACCESS_TOKEN);

export const removeAccesToken = () => sessionStorage.removeItem(ACCESS_TOKEN);

export const setUser = (username: string, accesToken: string) => {
  sessionStorage.setItem(User, username);
  setAccesToken(accesToken);
  history.push('/');
};

export const getUser = () => sessionStorage.getItem(User);

export const removeUser = () => {
  removeAccesToken();
  sessionStorage.removeItem(User);
  history.push('/');
  location.reload();
};

export const loginUrl =
  'https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-erhzmlq/auth/providers/local-userpass/login';

export const findUrl =
  'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-erhzmlq/endpoint/data/v1/action/find';

export const ACCESS_TOKEN = 'access_token';

export const setAccesToken = (accesToken: string) => {
  localStorage.setItem(ACCESS_TOKEN, accesToken);
};

export const getAccesToken = () => {
  localStorage.getItem(ACCESS_TOKEN);
};

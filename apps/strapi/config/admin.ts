export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin_jwt_secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api_token_salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer_token_salt'),
    },
  },
  flags: {
    nps: env('FLAG_NPS', 'true') === 'true',
    promoteEE: env('FLAG_PROMOTE_EE', 'true') === 'true',
  },
});

export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env('STRAPI_PORT', env('PORT', '8000')),
  app: {
    keys: env('APP_KEYS', 'key1,key2').split(','),
  },
  webhooks: {
    populateRelations: env('WEBHOOKS_POPULATE_RELATIONS', 'false') === 'true',
  },
});

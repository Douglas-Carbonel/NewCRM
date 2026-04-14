import path from 'path';

export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections: Record<string, unknown> = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: Number(env('DATABASE_PORT', '5432')),
        database: env('DATABASE_NAME', 'crm_db'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', 'postgres'),
        ssl: env('DATABASE_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: 2, max: 10 },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: 60000,
    },
  };
};

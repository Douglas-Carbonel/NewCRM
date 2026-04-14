import path from 'path';

export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => {
  const client = env('DATABASE_CLIENT', process.env.PGHOST ? 'postgres' : 'sqlite') as
    | 'sqlite'
    | 'postgres';

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: {
        host: env('DATABASE_HOST', process.env.PGHOST || 'localhost'),
        port: Number(env('DATABASE_PORT', process.env.PGPORT || '5432')),
        database: env('DATABASE_NAME', process.env.PGDATABASE || 'crm_db'),
        user: env('DATABASE_USERNAME', process.env.PGUSER || 'postgres'),
        password: env('DATABASE_PASSWORD', process.env.PGPASSWORD || 'postgres'),
        ssl: env('DATABASE_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: 2, max: 10 },
    },
  } as const;

  return {
    connection: {
      client,
      ...(connections[client] as Record<string, unknown>),
      acquireConnectionTimeout: 60000,
    },
  };
};

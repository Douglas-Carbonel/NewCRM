import hdb from 'hdb';

interface HanaConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  databaseName?: string;
}

const hanaConfig: HanaConfig = {
  host: process.env.HANA_HOST || '10.8.0.22',
  port: Number(process.env.HANA_PORT) || 30015,
  user: process.env.HANA_USER || 'SYSTEM',
  password: process.env.HANA_PASSWORD || '',
  databaseName: process.env.HANA_DATABASE,
};

let client: ReturnType<typeof hdb.createClient> | null = null;
let connecting = false;

function createClient() {
  const opts: Record<string, unknown> = {
    host: hanaConfig.host,
    port: hanaConfig.port,
    user: hanaConfig.user,
    password: hanaConfig.password,
  };
  if (hanaConfig.databaseName) {
    opts.databaseName = hanaConfig.databaseName;
  }
  return hdb.createClient(opts);
}

async function getConnection(): Promise<ReturnType<typeof hdb.createClient>> {
  if (client && client.readyState === 'connected') {
    return client;
  }

  if (connecting) {
    await new Promise((res) => setTimeout(res, 500));
    return getConnection();
  }

  connecting = true;
  client = createClient();

  return new Promise((resolve, reject) => {
    client!.connect((err: Error | null) => {
      connecting = false;
      if (err) {
        console.error('[HANA] Erro ao conectar:', err.message);
        client = null;
        reject(err);
      } else {
        console.log(`[HANA] Conectado em ${hanaConfig.host}:${hanaConfig.port} — ${hanaConfig.databaseName ?? 'default'}`);
        resolve(client!);
      }
    });
  });
}

export async function hanaQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const conn = await getConnection();

  return new Promise((resolve, reject) => {
    conn.exec(sql, params, (err: Error | null, rows: T[]) => {
      if (err) {
        console.error('[HANA] Query error:', err.message, '\nSQL:', sql.slice(0, 200));
        if (err.message?.includes('Connection') || err.message?.includes('socket')) {
          client = null;
        }
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function testHanaConnection(): Promise<boolean> {
  try {
    await hanaQuery('SELECT 1 FROM DUMMY');
    return true;
  } catch {
    return false;
  }
}

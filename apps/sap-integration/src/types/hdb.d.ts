declare module 'hdb' {
  interface HdbClientOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    databaseName?: string;
    [key: string]: unknown;
  }

  interface HdbClient {
    readyState: 'connected' | 'disconnected' | 'connecting' | 'closed';
    connect(callback: (err: Error | null) => void): void;
    exec(sql: string, params: unknown[], callback: (err: Error | null, rows: unknown[]) => void): void;
    exec(sql: string, callback: (err: Error | null, rows: unknown[]) => void): void;
    disconnect(callback?: (err: Error | null) => void): void;
  }

  function createClient(options: HdbClientOptions): HdbClient;

  export { createClient };
}

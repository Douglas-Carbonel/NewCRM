interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  invalidate(prefix?: string): number {
    if (!prefix) {
      const size = this.store.size;
      this.store.clear();
      return size;
    }
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  size(): number {
    return this.store.size;
  }
}

export const cache = new SimpleCache();

export const TTL = {
  CLIENTES_LIST:    5 * 60 * 1000,  // 5 min  — lista pode mudar com novo cliente
  CLIENTE_DETAIL:  15 * 60 * 1000,  // 15 min — dados do cliente mudam raramente
  CLIENTE_COMPLETE: 10 * 60 * 1000, // 10 min — inclui ordens, um pouco mais dinâmico
  BUSCA_NOME:       2 * 60 * 1000,  // 2 min  — busca textual muda mais
} as const;

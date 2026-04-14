'use client';

import { Cliente } from '@/types/cliente.types';
import { ClienteCard } from './ClienteCard';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';

interface ClienteListProps {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function ClienteList({ clientes, loading, error, onRetry }: ClienteListProps) {
  if (loading) return <LoadingState message="Buscando clientes no SAP..." />;

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!clientes.length) {
    return (
      <EmptyState
        title="Nenhum cliente encontrado"
        description="Tente ajustar os filtros ou a busca para encontrar clientes."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clientes.map((cliente) => (
        <ClienteCard key={cliente.CardCode} cliente={cliente} />
      ))}
    </div>
  );
}

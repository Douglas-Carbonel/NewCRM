'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClienteList } from '@/components/clientes/ClienteList';
import { NovoClienteModal } from '@/components/clientes/NovoClienteModal';
import { clienteService } from '@/services/cliente.service';
import { Cliente } from '@/types/cliente.types';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<'codigo' | 'nome'>('nome');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const PAGE_SIZE = 50;

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.listar({ top: PAGE_SIZE, skip: page * PAGE_SIZE });
      setClientes(data.value ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { erro?: string } }; message?: string };
      setError(e.response?.data?.erro ?? e.message ?? 'Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!search) fetchClientes();
  }, [fetchClientes, search]);

  async function handleSearch() {
    if (!search.trim()) {
      fetchClientes();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let data;
      if (searchType === 'codigo') {
        const cliente = await clienteService.buscarPorCodigo(search.trim());
        data = { value: [cliente] };
      } else {
        data = await clienteService.buscarPorNome(search.trim());
      }
      setClientes(data.value ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { erro?: string } }; message?: string };
      setError(e.response?.data?.erro ?? e.message ?? 'Erro ao buscar.');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearSearch() {
    setSearch('');
    setPage(0);
  }

  return (
    <div>
      <Header title="Clientes" />

      <div className="p-6 space-y-6">
        {/* Barra de ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden flex-1">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'codigo' | 'nome')}
              className="px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-sm text-gray-700 focus:outline-none"
            >
              <option value="nome">Por nome</option>
              <option value="codigo">Por código</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'codigo' ? 'Ex: C001' : 'Ex: Empresa Ltda'}
              className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-white"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Search size={16} />
            Buscar
          </button>

          <button
            onClick={fetchClientes}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>

          <button
            id="btn-novo-cliente"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Novo Cliente
          </button>
        </div>

        {!loading && !error && clientes.length > 0 && (
          <p className="text-sm text-gray-500">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
          </p>
        )}

        <ClienteList
          clientes={clientes}
          loading={loading}
          error={error}
          onRetry={fetchClientes}
        />

        {!loading && !error && !search && clientes.length === PAGE_SIZE && (
          <div className="flex justify-center gap-3">
            {page > 0 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* Modal de novo cliente */}
      {showModal && (
        <NovoClienteModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchClientes();
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  FileText,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { clienteService } from '@/services/cliente.service';
import { ClienteCompleto } from '@/types/cliente.types';

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardCode = decodeURIComponent(params.cardCode as string);

  const [data, setData] = useState<ClienteCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await clienteService.visaoCompleta(cardCode);
        setData(result);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { erro?: string } }; message?: string };
        setError(e.response?.data?.erro ?? e.message ?? 'Erro ao carregar cliente.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cardCode]);

  if (loading) return (
    <div>
      <Header title="Detalhes do Cliente" />
      <div className="p-6"><LoadingState message="Carregando dados do cliente..." /></div>
    </div>
  );

  if (error || !data) return (
    <div>
      <Header title="Detalhes do Cliente" />
      <div className="p-6">
        <ErrorState message={error ?? 'Cliente não encontrado.'} onRetry={() => router.back()} />
      </div>
    </div>
  );

  const { cliente, ordens, notas, tarefas } = data;

  const balance = cliente.Balance !== undefined
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cliente.Currency ?? 'BRL' }).format(cliente.Balance)
    : null;

  return (
    <div>
      <Header title={cliente.CardName} />
      <div className="p-6 space-y-6 max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para clientes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-700 font-bold text-lg">
                    {cliente.CardName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{cliente.CardName}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Código: {cliente.CardCode}</p>
                  {cliente.FederalTaxID && (
                    <p className="text-sm text-gray-500">CNPJ/CPF: {cliente.FederalTaxID}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cliente.Phone1 && (
                  <InfoRow icon={<Phone size={16} />} label="Telefone" value={cliente.Phone1} />
                )}
                {cliente.EmailAddress && (
                  <InfoRow icon={<Mail size={16} />} label="E-mail" value={cliente.EmailAddress} />
                )}
                {cliente.Website && (
                  <InfoRow icon={<Globe size={16} />} label="Website" value={cliente.Website} />
                )}
                {cliente.City && (
                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Cidade"
                    value={`${cliente.City}${cliente.CountryCode ? `, ${cliente.CountryCode}` : ''}`}
                  />
                )}
                {balance && (
                  <InfoRow icon={<CreditCard size={16} />} label="Saldo" value={balance} />
                )}
              </div>
            </div>

            {ordens && ordens.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} /> Pedidos recentes
                </h3>
                <div className="space-y-2">
                  {ordens.map((ordem) => (
                    <div
                      key={ordem.DocNum}
                      className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pedido #{ordem.DocNum}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(ordem.DocDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ordem.DocTotal)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ordem.DocStatus === 'O'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ordem.DocStatus === 'O' ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {notas && notas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Notas ({notas.length})
                </h3>
                <div className="space-y-3">
                  {notas.map((nota) => (
                    <div key={nota.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{nota.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{nota.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tarefas && tarefas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckSquare size={16} /> Tarefas ({tarefas.length})
                </h3>
                <div className="space-y-2">
                  {tarefas.map((tarefa) => (
                    <div key={tarefa.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        tarefa.priority === 'high' ? 'bg-red-500' :
                        tarefa.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{tarefa.title}</p>
                        {tarefa.dueDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(tarefa.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

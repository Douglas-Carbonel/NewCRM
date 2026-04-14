'use client';

import { useState, useEffect } from 'react';
import { Users, CheckSquare, Bell, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { strapiClient } from '@/services/api';
import { LoadingState } from '@/components/ui/LoadingState';

interface DashboardResumo {
  totalNotas: number;
  totalTarefas: number;
  tarefasPendentes: number;
  notificacoesNaoLidas: number;
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await strapiClient.get<{ resumo: DashboardResumo }>('/api/crm/dashboard/resumo');
        setResumo(data.resumo);
      } catch {
        setResumo({ totalNotas: 0, totalTarefas: 0, tarefasPendentes: 0, notificacoesNaoLidas: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6"><LoadingState /></div>
    </div>
  );

  const cards = [
    { label: 'Total de Notas', value: resumo?.totalNotas ?? 0, icon: FileText, color: 'indigo' },
    { label: 'Total de Tarefas', value: resumo?.totalTarefas ?? 0, icon: CheckSquare, color: 'blue' },
    { label: 'Tarefas Pendentes', value: resumo?.tarefasPendentes ?? 0, icon: Users, color: 'yellow' },
    { label: 'Notificações', value: resumo?.notificacoesNaoLidas ?? 0, icon: Bell, color: 'red' },
  ];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{label}</p>
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Bem-vindo ao CRM Platform</h3>
          <p className="text-sm text-gray-600">
            Plataforma integrada ao SAP Business One. Acesse <strong>Clientes</strong> para visualizar
            e buscar parceiros de negócios em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}

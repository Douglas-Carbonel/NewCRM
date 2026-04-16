'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { clienteService } from '@/services/cliente.service';

interface NovoClienteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  CardCode: string;
  CardName: string;
  Phone1: string;
  Cellular: string;
  EmailAddress: string;
  ContactPerson: string;
  FederalTaxID: string;
  City: string;
  Street: string;
  ZipCode: string;
}

const EMPTY: FormData = {
  CardCode: '',
  CardName: '',
  Phone1: '',
  Cellular: '',
  EmailAddress: '',
  ContactPerson: '',
  FederalTaxID: '',
  City: '',
  Street: '',
  ZipCode: '',
};

export function NovoClienteModal({ onClose, onSuccess }: NovoClienteModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.CardCode.trim()) { setError('CardCode é obrigatório.'); return; }
    if (!form.CardName.trim()) { setError('Nome do cliente é obrigatório.'); return; }

    setLoading(true);
    try {
      await clienteService.criar({
        ...form,
        CardCode: form.CardCode.trim(),
        CardName: form.CardName.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { erro?: string } }; message?: string };
      setError(e.response?.data?.erro ?? e.message ?? 'Erro ao criar cliente no SAP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <UserPlus size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Novo Cliente</h2>
              <p className="text-xs text-gray-500">Será criado diretamente no SAP Business One</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form id="novo-cliente-form" onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Identificação */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identificação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  name="CardCode"
                  value={form.CardCode}
                  onChange={handleChange}
                  placeholder="Ex: C00001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social / Nome <span className="text-red-500">*</span>
                </label>
                <input
                  name="CardName"
                  value={form.CardName}
                  onChange={handleChange}
                  placeholder="Ex: Empresa Exemplo Ltda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / CPF</label>
                <input
                  name="FederalTaxID"
                  value={form.FederalTaxID}
                  onChange={handleChange}
                  placeholder="Ex: 00.000.000/0001-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contato Principal</label>
                <input
                  name="ContactPerson"
                  value={form.ContactPerson}
                  onChange={handleChange}
                  placeholder="Nome do contato"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </section>

          {/* Contato */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  name="Phone1"
                  value={form.Phone1}
                  onChange={handleChange}
                  placeholder="(11) 3000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  name="Cellular"
                  value={form.Cellular}
                  onChange={handleChange}
                  placeholder="(11) 9 9000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="EmailAddress"
                  value={form.EmailAddress}
                  onChange={handleChange}
                  placeholder="contato@empresa.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Endereço</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                <input
                  name="Street"
                  value={form.Street}
                  onChange={handleChange}
                  placeholder="Av. Paulista, 1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  name="ZipCode"
                  value={form.ZipCode}
                  onChange={handleChange}
                  placeholder="01310-100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  name="City"
                  value={form.City}
                  onChange={handleChange}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </section>

          {/* Erro */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="novo-cliente-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus size={15} />
                Criar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

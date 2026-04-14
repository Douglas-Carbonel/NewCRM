import Link from 'next/link';
import { Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { Cliente } from '@/types/cliente.types';

interface ClienteCardProps {
  cliente: Cliente;
}

export function ClienteCard({ cliente }: ClienteCardProps) {
  const initials = cliente.CardName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const balance = cliente.Balance
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.Balance)
    : null;

  return (
    <Link
      href={`/clientes/${encodeURIComponent(cliente.CardCode)}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
          <span className="text-indigo-700 font-semibold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {cliente.CardName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{cliente.CardCode}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {cliente.Phone1 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{cliente.Phone1}</span>
          </div>
        )}
        {cliente.EmailAddress && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{cliente.EmailAddress}</span>
          </div>
        )}
        {cliente.City && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {cliente.City}
              {cliente.CountryCode ? `, ${cliente.CountryCode}` : ''}
            </span>
          </div>
        )}
        {balance && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={14} className="text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800">{balance}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

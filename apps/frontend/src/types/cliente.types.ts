export interface Cliente {
  CardCode: string;
  CardName: string;
  CardType?: string;
  Phone1?: string;
  Phone2?: string;
  Cellular?: string;
  EmailAddress?: string;
  ContactPerson?: string;
  CurrentAccountBalance?: number;
  OpenOrdersBalance?: number;
  CreditLimit?: number;
  City?: string;
  Country?: string;
  Currency?: string;
  FederalTaxID?: string;
}

export interface ClienteListResponse {
  value: Cliente[];
  'odata.metadata'?: string;
}

export interface ClienteCompleto {
  cliente: Cliente;
  ordens: Ordem[];
  notas?: CrmNota[];
  tarefas?: CrmTarefa[];
  historico?: CrmHistorico[];
}

export interface Ordem {
  DocNum: number;
  DocDate: string;
  DocTotal: number;
  DocStatus: 'O' | 'C';
}

export interface CrmNota {
  id: number;
  title: string;
  content: string;
  cardCode: string;
  type: 'call' | 'meeting' | 'email' | 'note' | 'other';
  pinned: boolean;
  createdAt: string;
}

export interface CrmTarefa {
  id: number;
  title: string;
  description?: string;
  cardCode: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

export interface CrmHistorico {
  id: number;
  cardCode: string;
  type: 'inbound' | 'outbound';
  channel: string;
  summary: string;
  contactDate: string;
}

export interface ApiError {
  erro: string;
  detalhe?: unknown;
}

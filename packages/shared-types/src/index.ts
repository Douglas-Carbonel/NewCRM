export interface SapBusinessPartner {
  CardCode: string;
  CardName: string;
  CardType?: string;
  Phone1?: string;
  Phone2?: string;
  EmailAddress?: string;
  ContactPerson?: string;
  Balance?: number;
  CreditLimit?: number;
  City?: string;
  CountryCode?: string;
  Currency?: string;
  Website?: string;
  FederalTaxID?: string;
}

export interface SapODataList<T> {
  value: T[];
  'odata.metadata'?: string;
  'odata.count'?: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  erro: string;
  detalhe?: unknown;
  status?: number;
}

export interface CrmNote {
  id: number;
  title: string;
  content: string;
  cardCode: string;
  type: 'call' | 'meeting' | 'email' | 'note' | 'other';
  pinned: boolean;
  authorId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrmTask {
  id: number;
  title: string;
  description?: string;
  cardCode: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrmNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  userId: number;
  cardCode?: string;
  link?: string;
  createdAt: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  top?: number;
  skip?: number;
}

export type SapServiceStatus = 'healthy' | 'degraded' | 'down';

export interface HealthCheck {
  ok: boolean;
  service: string;
  version?: string;
  timestamp: string;
  sapStatus?: SapServiceStatus;
}

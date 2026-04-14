export interface SapBusinessPartner {
  CardCode: string;
  CardName: string;
  CardType?: string;
  GroupCode?: number;
  Phone1?: string;
  Phone2?: string;
  Fax?: string;
  EmailAddress?: string;
  ContactPerson?: string;
  Notes?: string;
  PayTermsGrpCode?: number;
  CreditLimit?: number;
  Discount?: number;
  VatLiable?: string;
  FederalTaxID?: string;
  SalesPersonCode?: number;
  Currency?: string;
  BillToState?: string;
  Cellular?: string;
  Indicator?: string;
  Website?: string;
  ShippingType?: number;
  City?: string;
  County?: string;
  CountryCode?: string;
  ZipCode?: string;
  StreetNo?: string;
  Block?: string;
  Street?: string;
  AliasName?: string;
  Series?: number;
  Balance?: number;
  ChecksBal?: number;
  DNotesBal?: number;
  OrdersBal?: number;
  GroupName?: string;
}

export interface SapODataResponse<T> {
  value: T[];
  'odata.metadata'?: string;
}

export interface SapError {
  error: {
    code: number;
    message: {
      lang: string;
      value: string;
    };
  };
}

export interface ApiErrorResponse {
  erro: string;
  detalhe?: unknown;
}

export interface SapQueryOptions {
  select?: string;
  filter?: string;
  orderby?: string;
  top?: number;
  skip?: number;
}

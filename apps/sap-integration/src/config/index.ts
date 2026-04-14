import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sap: {
    url: process.env.SAP_URL || 'https://177.8.39.34:50000/b1s/v1',
    company: process.env.SAP_COMPANY || 'SBODEMOBR_DEV',
    user: process.env.SAP_USER || '',
    password: process.env.SAP_PASSWORD || '',
    timeoutMs: Number(process.env.SAP_TIMEOUT_MS) || 15000,
  },
} as const;

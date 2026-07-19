import { Platform } from "react-native";

// iOS simulator can reach Mac via localhost; use 10.0.2.2 for Android emulator
// Use your desktop/laptop IP for local testing - example - 192.168.1.24
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:8000/api/v1',
    default: 'http://localhost:8000/api/v1',   // iOS sim + web
});

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  currency: string;
  merchant: string | null;
  date: string | null;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category?: string;
  currency?: string;
  merchant?: string;
  date?: string;
}

export interface DashboardSummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface DocumentParseResponse {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  currency: string;
  merchant: string | null;
  date: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getTransactions: () => request<Transaction[]>('/transactions'),

  createTransaction: (data: TransactionCreate) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),

  parseDocument: async (fileUri: string, fileName: string, mimeType: string): Promise<DocumentParseResponse[]> => {
    const form = new FormData();
    form.append('file', { uri: fileUri, name: fileName, type: mimeType } as unknown as Blob);
    const res = await fetch(`${BASE_URL}/transactions/from-document`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json();
  },
};

import type { Summary, Transaction, TransactionType } from "./types";

export type { TransactionType } from "./types";

const API_BASE = "/api/v1";

export interface ParsedDocumentPayload {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  date?: string;
}

export interface TransactionCreatePayload {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  date?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }

  return response.json() as Promise<T>;
}

export async function fetchSummary(): Promise<Summary> {
  const response = await fetch(`${API_BASE}/dashboard/summary`);
  return handleResponse<Summary>(response);
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions`);
  return handleResponse<Transaction[]>(response);
}

export async function createTransaction(
  payload: TransactionCreatePayload,
): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Transaction>(response);
}

export async function parseTransactionFromDocument(file: File): Promise<ParsedDocumentPayload[]> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/transactions/from-document`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<ParsedDocumentPayload[]>(response);
}

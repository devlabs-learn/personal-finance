export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  date: string;
  created_at: string;
}

export interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

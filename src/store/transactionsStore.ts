
import { create } from 'zustand';

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  fee: string;
  isIncoming: boolean;
  changeAddress?: string;
  changeAmount?: string;
}

interface TransactionsState {
  address: string;
  transactions: Transaction[];
  setTransactions: (address: string, transactions: Transaction[]) => void;
  clearTransactions: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  address: '',
  transactions: [],
  setTransactions: (address, transactions) => set({ address, transactions }),
  clearTransactions: () => set({ address: '', transactions: [] }),
}));

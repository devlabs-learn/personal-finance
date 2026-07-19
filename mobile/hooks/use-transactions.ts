import { useCallback, useEffect, useState } from 'react';
import { api, Transaction } from '@/services/api';

interface State {
  data: Transaction[];
  loading: boolean;
  error: string | null;
}

export function useTransactions() {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null });

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.getTransactions();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: [], loading: false, error: (e as Error).message });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refresh: fetch };
}

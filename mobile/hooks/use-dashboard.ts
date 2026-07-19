import { useCallback, useEffect, useState } from 'react';
import { api, DashboardSummary } from '@/services/api';

interface State {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.getDashboardSummary();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: (e as Error).message });
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refresh: fetch };
}

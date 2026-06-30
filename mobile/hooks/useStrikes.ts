import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Strike = {
  id: number;
  start_date: string;
  end_date: string | null;
  sector: string;
  relevance: string;
  region: string;
  union_name: string;
  mode: string;
  category: string;
  title: string;
};

// Friendly sector labels for display.
const SECTOR_LABELS: Record<string, string> = {
  aereo:                  'Aviation ✈️',
  ferroviario:            'Rail 🚆',
  marittimo:              'Ferries ⛴️',
  taxi:                   'Taxis 🚕',
  ncc:                    'Private hire 🚖',
  'trasporto locale':     'Local transport 🚇',
  tpl:                    'Local transport 🚇',
  generale:               'All transport 🚨',
  'generale/plurisettoriale': 'All transport 🚨',
  plurisettoriale:        'Multi-sector 🚨',
};

export function sectorLabel(sector: string): string {
  return SECTOR_LABELS[sector.toLowerCase()] ?? sector;
}

export function useStrikes() {
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('strikes')
      .select('*')
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        setStrikes((data as Strike[]) ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { strikes, loading };
}

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Spot } from '@/constants/discover';

// Dev-only reordering for Top 10 lists (see constants/editMode.ts).
// Stores a per-list array of spot NAMES in the chosen order. Names (not
// indexes) so that editing discover.ts later doesn't scramble a saved order —
// any name that no longer exists is simply ignored, and any new spot in the
// file appends at the end.

const key = (listId: string) => `helpmenapoli.spotOrder.${listId}`;

function applyOrder(items: Spot[], order: string[]): Spot[] {
  if (!order.length) return items;
  const byName = new Map(items.map((s) => [s.name, s]));
  const ordered: Spot[] = [];
  for (const name of order) {
    const spot = byName.get(name);
    if (spot) { ordered.push(spot); byName.delete(name); }
  }
  // Anything added to discover.ts since the order was saved goes last.
  return [...ordered, ...byName.values()];
}

export function useSpotOrder(listId: string, items: Spot[]) {
  const [ordered, setOrdered] = useState<Spot[]>(items);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key(listId));
        const order: string[] = raw ? JSON.parse(raw) : [];
        if (alive) setOrdered(applyOrder(items, order));
      } catch {
        if (alive) setOrdered(items);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [listId, items]);

  const persist = useCallback(async (next: Spot[]) => {
    setOrdered(next);
    try {
      await AsyncStorage.setItem(key(listId), JSON.stringify(next.map((s) => s.name)));
    } catch { /* best-effort; the on-screen order still updated */ }
  }, [listId]);

  const move = useCallback((index: number, dir: -1 | 1) => {
    setOrdered((cur) => {
      const target = index + dir;
      if (target < 0 || target >= cur.length) return cur;
      const next = [...cur];
      [next[index], next[target]] = [next[target], next[index]];
      AsyncStorage.setItem(key(listId), JSON.stringify(next.map((s) => s.name))).catch(() => {});
      return next;
    });
  }, [listId]);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(key(listId)).catch(() => {});
    setOrdered(items);
  }, [listId, items]);

  return { ordered, move, reset, persist, loaded };
}

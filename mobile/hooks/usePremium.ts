import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'helpmenapoli.premium';

let listeners: Array<(v: boolean) => void> = [];
let cached: boolean | null = null;

export function usePremium() {
  const [isPremium, setIsPremium] = useState<boolean>(cached ?? false);

  useEffect(() => {
    if (cached !== null) { setIsPremium(cached); return; }
    AsyncStorage.getItem(KEY).then((v) => {
      cached = v === 'true';
      setIsPremium(cached);
    });
  }, []);

  useEffect(() => {
    const handler = (v: boolean) => setIsPremium(v);
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  const unlock = useCallback(async () => {
    await AsyncStorage.setItem(KEY, 'true');
    cached = true;
    listeners.forEach((l) => l(true));
  }, []);

  return { isPremium, unlock };
}

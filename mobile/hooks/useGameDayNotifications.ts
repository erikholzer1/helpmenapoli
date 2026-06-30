import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleGameDayNotifications() {
  const granted = await requestPermissions();
  if (!granted) return;

  // Fetch upcoming Napoli home games (next 60 days).
  const today = new Date().toISOString().slice(0, 10);
  const { data: games } = await supabase
    .from('events')
    .select('title, date, time')
    .eq('source', 'napoli_home')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(10);

  if (!games?.length) return;

  // Cancel any previously scheduled game-day notifications to avoid duplicates.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const gameNotifIds = scheduled
    .filter((n) => n.content.data?.type === 'gameday')
    .map((n) => n.identifier);
  await Promise.all(gameNotifIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));

  // Schedule a notification at 09:00 on each game day.
  for (const game of games) {
    const [year, month, day] = game.date.split('-').map(Number);
    const trigger = new Date(year, month - 1, day, 9, 0, 0);
    if (trigger <= new Date()) continue; // already past

    const kickoffText = game.time ? ` Kickoff ${game.time}.` : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔵 Napoli home game today — plan your route`,
        body: `Heavy traffic expected around Fuorigrotta and on the Tangenziale (Centro exit).${kickoffText} Allow extra time if travelling near the Maradona.`,
        data: { type: 'gameday', date: game.date },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });
  }

  console.log(`Scheduled ${games.length} game-day notification(s).`);
}

export function useGameDayNotifications() {
  useEffect(() => {
    scheduleGameDayNotifications().catch(console.warn);
  }, []);
}

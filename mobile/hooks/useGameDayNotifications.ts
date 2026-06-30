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

  // Schedule a notification at 08:00 on each game day.
  for (const game of games) {
    const [year, month, day] = game.date.split('-').map(Number);
    const trigger = new Date(year, month - 1, day, 8, 0, 0);
    if (trigger <= new Date()) continue; // already past

    // Work out kickoff hour for the "from X:XX" text.
    const kickoffText = game.time
      ? `Kickoff at ${game.time}.`
      : 'Check kickoff time.';

    // Estimate 4h before kickoff for traffic warning.
    let trafficFromText = '';
    if (game.time) {
      const [h, m] = game.time.split(':').map(Number);
      const warningHour = h - 4;
      if (warningHour >= 0) trafficFromText = ` Heavy traffic around Fuorigrotta & the Tangenziale from ${warningHour}:${m.toString().padStart(2, '0')}.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔵 ${game.title} — today at Maradona`,
        body: `${kickoffText}${trafficFromText} Plan your route.`,
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

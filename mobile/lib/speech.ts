import * as Speech from 'expo-speech';

// Speaks Italian text aloud using the device's built-in Italian voice.
// Works on iOS, Android, and web (browser SpeechSynthesis). Slightly slowed
// down to help learners catch the pronunciation.
export function speak(text: string) {
  const clean = text?.trim();
  if (!clean) return;
  Speech.stop();
  Speech.speak(clean, { language: 'it-IT', rate: 0.9, pitch: 1.0 });
}

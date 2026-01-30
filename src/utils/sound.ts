// src/utils/sound.ts
export function playNotificationSound() {
  if (typeof window === "undefined") return;

  const audio = new Audio("/kaching.mp3");
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

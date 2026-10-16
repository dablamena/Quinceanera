import { Volume2, VolumeX } from "lucide-react";

/**
 * Floating control to mute/unmute the background music.
 * Hidden entirely while no audio file is available, so guests never see a
 * broken or "pending" state in production.
 */
export function MusicToggle({ enabled, playing, unavailable, onToggle }) {
  if (unavailable) return null;

  const active = enabled && playing;
  const label = enabled ? "Silenciar música" : "Reproducir música";

  return (
    <button
      type="button"
      className={`music-toggle ${active ? "is-playing" : ""}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={enabled}
      title={label}
    >
      {enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
    </button>
  );
}

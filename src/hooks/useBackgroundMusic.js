import { useCallback, useEffect, useRef, useState } from "react";

const preferenceKey = "quinces-background-music-enabled";
const defaultVolume = 0.24;

function readPreference() {
  return localStorage.getItem(preferenceKey) !== "false";
}

export function useBackgroundMusic(src) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(readPreference);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);

  // The audio element's "play"/"pause" events are the single source of truth
  // for `playing`, so this function never calls setState directly.
  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabled || unavailable) return;

    try {
      await audio.play();
    } catch {
      // Autoplay was blocked; playback will be retried after a user gesture.
    }
  }, [enabled, unavailable]);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = defaultVolume;
    // Don't compete with the intro video/hero assets for bandwidth: the
    // browser won't fetch audio bytes until play() is actually called.
    audio.preload = "none";
    audioRef.current = audio;

    const markPlaying = () => setPlaying(true);
    const markPaused = () => setPlaying(false);
    const markUnavailable = () => {
      setUnavailable(true);
      setPlaying(false);
    };

    audio.addEventListener("play", markPlaying);
    audio.addEventListener("pause", markPaused);
    audio.addEventListener("error", markUnavailable);

    return () => {
      audio.pause();
      audio.removeEventListener("play", markPlaying);
      audio.removeEventListener("pause", markPaused);
      audio.removeEventListener("error", markUnavailable);
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    localStorage.setItem(preferenceKey, String(enabled));

    if (!enabled) {
      // Pausing fires the "pause" event, whose listener updates `playing`,
      // so we avoid calling setState synchronously inside the effect body.
      audioRef.current?.pause();
      return undefined;
    }

    attemptPlay();

    const startAfterInteraction = () => attemptPlay();
    window.addEventListener("pointerdown", startAfterInteraction, { once: true });
    window.addEventListener("keydown", startAfterInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
    };
  }, [attemptPlay, enabled]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const audio = audioRef.current;

      if (!audio || unavailable) return;

      if (document.hidden) {
        wasPlayingBeforeHidden.current = !audio.paused;

        if (!audio.paused) {
          audio.pause();
        }
      } else if (enabled && wasPlayingBeforeHidden.current) {
        await attemptPlay();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, [attemptPlay, enabled, unavailable]);

  const toggle = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  return { enabled, playing, unavailable, toggle };
}

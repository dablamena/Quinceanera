// Background music file. Served from /public so it is available in production
// and can be added later by simply dropping the MP3 into public/audio/.
export const backgroundAudioSrc =
  import.meta.env.VITE_BACKGROUND_AUDIO_SRC || "/audio/quinces-background.mp3";

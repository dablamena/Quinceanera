import { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import { MusicToggle } from "./components/MusicToggle";
import { Intro } from "./components/Intro";
import { Invitation } from "./components/Invitation";
import { backgroundAudioSrc } from "./config/audio";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";

function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const music = useBackgroundMusic(backgroundAudioSrc);

  return (
    <>
      <Intro onEnvelopeOpen={() => setEnvelopeOpened(true)} />

      {/* Mounted as soon as the guest starts opening the envelope, so its
          galleries, textures and map embeds never compete with the intro
          video for bandwidth on first load. */}
      {envelopeOpened && <Invitation />}

      <MusicToggle
        enabled={music.enabled}
        playing={music.playing}
        unavailable={music.unavailable}
        onToggle={music.toggle}
      />

      <Analytics />
    </>
  );
}

export default App;

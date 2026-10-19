import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import heroQuinces from "../assets/img/hero-quinces.gif";

const quincesLogo = "/img/quinces-logo.webp";
const invitationCover = "/img/invitation-cover.webp";
const invitationOpening = "/vid/invitation-opening.mp4";

/**
 * Envelope-opening sequence and hero header. Mounted immediately so a guest
 * always sees something within the first paint; everything past this point
 * (galleries, maps, RSVP) lives in <Invitation> and only loads once the
 * envelope has been opened.
 */
export function Intro({ onEnvelopeOpen }) {
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const introVideo = useRef(null);
  const wasVideoPlayingBeforeHidden = useRef(false);

  useEffect(() => {
    document.body.classList.toggle("invitation-locked", !invitationOpen);
    return () => document.body.classList.remove("invitation-locked");
  }, [invitationOpen]);

  // Safety net: a slow connection, a codec quirk, or a stalled/aborted
  // request must never leave a guest stuck looking at the envelope forever.
  // Whatever happens to the video, the invitation opens on its own well
  // within a guest's patience.
  useEffect(() => {
    if (!envelopeOpening) return undefined;
    const timeoutId = setTimeout(() => setInvitationOpen(true), 5000);
    return () => clearTimeout(timeoutId);
  }, [envelopeOpening]);

  // If a guest switches apps mid-opening (e.g. a WhatsApp notification), the
  // video would otherwise keep playing off-screen and could finish before
  // they come back. Pause it while hidden and resume from the same frame,
  // exactly like useBackgroundMusic already does for the audio track.
  useEffect(() => {
    if (invitationOpen) return undefined;

    const handleVisibilityChange = async () => {
      const video = introVideo.current;
      if (!video) return;

      if (document.hidden) {
        wasVideoPlayingBeforeHidden.current = !video.paused;
        if (!video.paused) video.pause();
      } else if (wasVideoPlayingBeforeHidden.current) {
        try {
          await video.play();
        } catch {
          // Autoplay may be blocked after returning; the guest can tap again.
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [invitationOpen]);

  function openInvitation() {
    if (envelopeOpening) return;
    setEnvelopeOpening(true);
    onEnvelopeOpen();
    introVideo.current?.play().catch(() => { });
  }

  function trackIntroProgress() {
    const video = introVideo.current;
    if (!video) return;
    if (video.currentTime > 0.05) setIntroVisible(true);
    if (video.duration - video.currentTime <= 0.8 && !invitationOpen) {
      setInvitationOpen(true);
    }
  }

  function handleIntroError() {
    setInvitationOpen(true);
  }

  return (
    <>
      <section
        className={`invitation-cover ${envelopeOpening ? "is-opening" : ""} ${invitationOpen ? "is-open" : ""}`}
        aria-hidden={invitationOpen}
        aria-label="Abrir invitación"
        role="button"
        tabIndex={invitationOpen ? -1 : 0}
        onClick={openInvitation}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openInvitation();
          }
        }}
      >
        <img className={`intro-media intro-poster ${introVisible ? "hidden" : ""}`} src={invitationCover} alt="" />
        <video
          className={`intro-media intro-video ${introVisible ? "visible" : ""}`}
          ref={introVideo}
          src={invitationOpening}
          poster={invitationCover}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onTimeUpdate={trackIntroProgress}
          onEnded={() => setInvitationOpen(true)}
          onError={handleIntroError}
        />
        {!envelopeOpening && <p className="intro-hint">Toca para abrir</p>}
      </section>

      <header className="hero" id="inicio" style={{ backgroundImage: `url(${heroQuinces})` }}>
        <nav className="navbar">
          <a className="brand" href="#inicio">
            <img src={quincesLogo} width={44} height={44} alt="Volver al inicio" />
          </a>
          <div className="nav-links">
            <a href="#detalles">El gran día</a>
            <a href="#contacto">Contacto</a>
            <a href="#confirmar">Confirmar</a>
          </div>
        </nav>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1><em className="quinceanera-title">
            <span>Ana María</span>
          </em></h1>
          <p className="hero-date">11 · 12 · 2026</p>
          <a className="outline-button" href="#bienvenida">Descubre los detalles</a>
        </div>
        <a className="scroll-hint" href="#bienvenida" aria-label="Continuar">
          <b><ChevronDown aria-hidden="true" /></b>
        </a>
      </header>
    </>
  );
}

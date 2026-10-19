import { useEffect, useState } from "react";
import { Check, X, Baby, User, UserPlus } from "lucide-react";
import {
  buildRsvpPayload,
  submitRsvpPayload,
  validateRsvpPayload,
} from "../services/rsvpService";

import quinceanera1 from "../assets/img/quinceanera-1.jpg";
import quinceanera2 from "../assets/img/quinceanera-2.jpg";
import quinceanera3 from "../assets/img/quinceanera-3.jpg";
import quinceanera4 from "../assets/img/quinceanera-4.jpg";
import quinceanera5 from "../assets/img/quinceanera-5.jpg";
import quinceanera6 from "../assets/img/quinceanera-6.jpg";
import quinceanera7 from "../assets/img/quinceanera-7.jpg";
import quinceanera8 from "../assets/img/quinceanera-8.jpg";
import quinceanera9 from "../assets/img/quinceanera-9.jpg";

import dress1 from "../assets/img/dress-1.jpg";
import dress2 from "../assets/img/dress-2.jpg";
import dress3 from "../assets/img/dress-3.jpg";
import dress4 from "../assets/img/dress-4.jpg";

import floralOrnament from "../assets/img/floral-ornament.webp";
import bowOrnament from "../assets/img/bow-ornament.webp";

import stars from "../assets/vid/stars.mp4";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Import Swiper required modules
import { Pagination, Mousewheel, Keyboard } from "swiper/modules";

const quincesDate = new Date("2026-12-11T19:00:00-05:00");

const quinceaneraGallery = [
  { id: 1, src: quinceanera1, alt: "Quinceañera recostada en pared" },
  { id: 2, src: quinceanera2, alt: "Quinceañera tocando su cabello con ambas manos" },
  { id: 3, src: quinceanera3, alt: "Quinceañera sentada" },
  { id: 4, src: quinceanera4, alt: "Quinceañera con mano arriba" },
  { id: 5, src: quinceanera5, alt: "Quinceañera recostada en pared" },
  { id: 6, src: quinceanera6, alt: "Quinceañera tocando su cabello con una mano" },
  { id: 7, src: quinceanera7, alt: "Quinceañera con mano en la cintura" },
  { id: 8, src: quinceanera8, alt: "Quinceañera recostada" },
  { id: 9, src: quinceanera9, alt: "Quinceañera con mano en la cintura y rostro" },
];

const dressCodeGallery = [
  { id: 1, src: dress1, alt: "Referencia de vestimenta femenina 1" },
  { id: 2, src: dress2, alt: "Referencia de vestimenta masculina 1" },
  { id: 3, src: dress3, alt: "Referencia de vestimenta femenina 2" },
  { id: 4, src: dress4, alt: "Referencia de vestimenta masculina 2" },
];

const contactMessage =
  "¡Hola! ¿Podrías ayudarme con indicaciones para llegar a la celebración de los 15 años? 😅🙏";

const contactWhatsAppUrl =
  `https://wa.me/573133422193?text=${encodeURIComponent(contactMessage)}`;

const mapUrlReception =
  "https://www.google.com/maps/search/?api=1&query=Celebraciones+Argento+Cristal,+Envigado,+Antioquia";

const mapEmbedUrlReception =
  "https://www.google.com/maps?q=Celebraciones%20Argento%20Cristal%2C%20Envigado%2C%20Antioquia&t=k&output=embed";

const swiperSettings = {
  slidesPerView: "auto",
  spaceBetween: 16,
  centeredSlides: true,
  centeredSlidesBounds: true,
  centerInsufficientSlides: true,
  speed: 600,
  grabCursor: true,
  resistance: true,
  resistanceRatio: 0.5,
  longSwipesRatio: 0.25,
  watchSlidesProgress: true,
  simulateTouch: true,
  mousewheel: { forceToAxis: true },
  pagination: { clickable: true },
  keyboard: { enabled: true },
  modules: [Pagination, Mousewheel, Keyboard],
  className: "mySwiper",
};

function getCountdown() {
  const distance = Math.max(0, quincesDate.getTime() - Date.now());

  return [
    ["Días", Math.floor(distance / 86400000)],
    ["Horas", Math.floor((distance / 3600000) % 24)],
    ["Minutos", Math.floor((distance / 60000) % 60)],
    ["Segundos", Math.floor((distance / 1000) % 60)],
  ];
}

export function Invitation() {
  const [countdown, setCountdown] = useState(getCountdown);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpData, setRsvpData] = useState(null);
  const [attendance, setAttendance] = useState("yes");
  const [ageRange, setAgeRange] = useState("adult");

  useEffect(() => {
    const intervalId = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  async function submitRsvp(event) {
    event.preventDefault();
    // Keep a reference to the form element: event.currentTarget becomes null
    // after the first await, so it cannot be used for reset() later on.
    const formElement = event.currentTarget;
    const payload = buildRsvpPayload(new FormData(formElement), attendance);
    const validationError = validateRsvpPayload(payload);

    if (validationError) {
      setRsvpError(validationError);
      return;
    }

    setRsvpSending(true);
    setRsvpError("");

    try {
      await submitRsvpPayload(payload);

      setRsvpData(payload);

      formElement.reset();
      setAttendance("yes");
      setAgeRange("adult");
      setRsvpSent(true);
    } catch (error) {
      console.error("No se pudo registrar el RSVP:", error);
      setRsvpError("No pudimos registrar tu respuesta. Inténtalo nuevamente.");
    } finally {
      setRsvpSending(false);
    }
  }

  return (
    <>
      <main>
        <section className="gallery-section light-paper-section" id="bienvenida">
          <p className="kicker">Celebremos juntos mis</p>
          <h2>¡Quince Años!</h2>

          <p className="lead">
            Con mucha ilusión celebro este momento tan especial y deseo compartir
            esta noche inolvidable con quienes llenan mi vida de alegría.
          </p>

          <Swiper {...swiperSettings}>
            {quinceaneraGallery.map((image) => (
              <SwiperSlide key={`quinceanera-img-${image.id}`}>
                <img src={image.src} alt={image.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section className="countdown-section" id="contador">
          <p className="kicker light">La espera comienza</p>
          <h2>Faltan solamente</h2>
          <div className="countdown">
            {countdown.map(([label, value]) => (
              <div className="countdown-item" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="details-section dark-paper-section" id="detalles">
          <p className="kicker">Guarda la fecha</p>
          <h2>El gran día</h2>
          <div className="details-grid">
            <article>
              <h3>Cuándo</h3>
              <p>7 p.m.<br /><b>11 de diciembre de 2026</b></p>
              <a href="#contador" rel="noreferrer">Ver contador</a>
            </article>
            <article>
              <h3>Dónde</h3>
              <p>Salón de Eventos<br /><b>Celebraciones Argento Cristal</b></p>
              <a href="#ubicacion" rel="noreferrer">Ver ubicación</a>
            </article>
            <article>
              <h3>Vestuario</h3>
              <p>Noche y Estrellas<br /><b>Código de vestuario</b></p>
              <a href="#vestimenta" rel="noreferrer">Ver referencias</a>
            </article>
          </div>
        </section>

        <section className="map-section light-paper-section" id="ubicacion">
          <div className="map-copy">
            <p className="kicker">Cómo llegar</p>
            <p>Celebraciones Argento Cristal</p>
            <span>Carrera 81 av 80 # 34a 137, Medellín, Antioquia</span>
            <a className="map-link" href={mapUrlReception} target="_blank" rel="noreferrer">Abrir en Google Maps</a>
          </div>
          <iframe
            title="Mapa de Celebraciones Argento Cristal"
            src={mapEmbedUrlReception}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </section>

        <section className="schedule-section dark-paper-section" id="contacto">
          <h3>¿Necesitas más ayuda para llegar?</h3>
          <p>
            Si requieres una orientación más específica o tienes algún imprevisto,
            puedes contactarnos por este medio.
          </p>
          <a className="contact-link" href={contactWhatsAppUrl} target="_blank" rel="noreferrer">Contactar vía WhatsApp</a>
        </section>

        <section className="gallery-section light-paper-section" id="vestimenta">
          <p className="kicker">Referencias de</p>
          <h2>Vestimenta</h2>

          <p className="lead">
            Para estar en armonía con el tema <i>Noche y Estrellas</i>, los invitamos a vestir un atuendo elegante y cómodo
            en tonos blancos o azul claro. Agradecemos reservar los tonos dorados y oscuros exclusivamente para la familia.
          </p>

          <Swiper {...swiperSettings}>
            {dressCodeGallery.map((image) => (
              <SwiperSlide key={`dress-code-img-${image.id}`}>
                <img src={image.src} alt={image.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section className="quote-section">
          <video
            className="quote-video"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          >
            <source src={stars} type="video/mp4" />
          </video>

          <div className="quote-content">
            <p>“Haz de tu vida un sueño y de tu sueño una realidad.”</p>
            <span>- Antoine de Saint-Exupéry</span>
          </div>
        </section>

        <section className="gift-section light-paper-section" id="regalos">
          <p className="kicker">Lazos en forma de</p>
          <h2>Obsequios</h2>
          <p className="lead">
            Tu presencia es lo más importante para nosotros. Si además deseas
            tener un detalle, hemos preparado una opción sencilla.
          </p>
          <div className="gift-card">
            <h3>Lluvia de sobres</h3>
            <p>Encontrarás un espacio especial durante la celebración.</p>
          </div>
        </section>

        <section className="rsvp-section" id="confirmar">
          <div className="rsvp-intro">
            <h2>Confirmar asistencia</h2>
            <p>Completa este formulario para ayudarnos a preparar cada detalle.</p>
          </div>
          {rsvpSent ? (
            <div className="rsvp-confirmation">
              <div className="ornament">
                <img src={bowOrnament} width={88} height="auto" loading="lazy" alt="" />
              </div>
              <h3>
                {rsvpData?.attendance === "yes"
                  ? "¡Gracias por confirmar!"
                  : "¡Gracias por avisar!"}
              </h3>
              <p>
                {rsvpData?.attendance === "yes"
                  ? "Hemos registrado tu respuesta. Nos alegra compartir este momento tan especial contigo."
                  : "Hemos registrado tu respuesta. Aunque no puedas asistir, te tendremos presente."}
              </p>
              <button type="button" onClick={() => setRsvpSent(false)}>Enviar otra respuesta</button>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={submitRsvp}>
              <fieldset className="attendance-field">
                <legend>¿Podrás acompañarnos?</legend>
                <div className="confirmation-options">
                  <label className={attendance === "yes" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="attendance"
                      value="yes"
                      checked={attendance === "yes"}
                      onChange={() => setAttendance("yes")}
                    />
                    <Check className="h-5 w-5" aria-hidden="true" />
                    <span>Sí, allí estaré</span>
                  </label>

                  <label className={attendance === "no" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      checked={attendance === "no"}
                      onChange={() => setAttendance("no")}
                    />
                    <X className="h-5 w-5" aria-hidden="true" />
                    <span>No podré asistir</span>
                  </label>
                </div>
              </fieldset>

              <div className="form-grid">
                <label>
                  Nombre completo *
                  <input name="fullName" required placeholder="Escribe tu nombre" />
                </label>
                <label>
                  Teléfono
                  <input name="phone" type="tel" placeholder="+57 300 000 0000" />
                </label>
                {attendance === "yes" && (
                  <>
                    <fieldset className="attendance-field age-field">
                      <legend>Rango de edad</legend>
                      <div className="age-options">
                        <label className={ageRange === "child" ? "selected" : ""}>
                          <input
                            type="radio"
                            name="ageRange"
                            value="child"
                            checked={ageRange === "child"}
                            onChange={() => setAgeRange("child")}
                          />
                          <Baby className="h-5 w-5" aria-hidden="true" />
                          <span>Niño</span>
                        </label>

                        <label className={ageRange === "young" ? "selected" : ""}>
                          <input
                            type="radio"
                            name="ageRange"
                            value="young"
                            checked={ageRange === "young"}
                            onChange={() => setAgeRange("young")}
                          />
                          <User className="h-5 w-5" aria-hidden="true" />
                          <span>Joven</span>
                        </label>

                        <label className={ageRange === "adult" ? "selected" : ""}>
                          <input
                            type="radio"
                            name="ageRange"
                            value="adult"
                            checked={ageRange === "adult"}
                            onChange={() => setAgeRange("adult")}
                          />
                          <UserPlus className="h-5 w-5" aria-hidden="true" />
                          <span>Adulto</span>
                        </label>
                      </div>
                    </fieldset>

                    <label className="form-full">
                      Restricciones alimentarias
                      <input name="dietary" placeholder="Vegetariano, alergias u otras indicaciones" />
                    </label>
                  </>
                )}
                <label className="form-full">
                  Mensaje para la quinceañera
                  <textarea name="message" rows="4" placeholder="Escribe unas palabras especiales" />
                </label>
              </div>
              {rsvpError && <p className="form-error">{rsvpError}</p>}
              <button className="submit-button" type="submit" disabled={rsvpSending}>
                {rsvpSending ? "Enviando..." : "Enviar confirmación"}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="light-paper-section">
        <div className="footer-overlay light-paper-section" />
        <section>
          <div className="ornament">
            <img src={floralOrnament} width={88} height="auto" loading="lazy" alt="" />
          </div>
          <p className="signature">Quince Años</p>
          <span>11 · 12 · 2026</span>
        </section>
      </footer>
    </>
  );
}

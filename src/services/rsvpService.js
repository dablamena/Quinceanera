import { ageRangeLabels, attendanceLabels, rsvpEndpoint } from "../config/rsvp";

// Fallback storage key used only when no Apps Script endpoint is configured
// (e.g. local development without a backend).
const localStorageKey = "quinces-rsvps";

function cleanText(value) {
  return String(value || "").trim();
}

/**
 * Builds the normalized payload sent to Apps Script from the raw form data.
 * Human-readable labels are included so the backend (email + sheet) does not
 * need to duplicate the frontend's label maps.
 */
export function buildRsvpPayload(formData, attendance) {
  const ageRange = cleanText(formData.get("ageRange")) || "adult";

  return {
    attendance,
    attendanceLabel: attendanceLabels[attendance] || attendance,
    fullName: cleanText(formData.get("fullName")),
    phone: cleanText(formData.get("phone")),
    ageRange,
    ageRangeLabel: ageRangeLabels[ageRange] || ageRange,
    dietary: cleanText(formData.get("dietary")),
    message: cleanText(formData.get("message")),
    createdAt: new Date().toISOString(),
    source: window.location.href,
  };
}

/** Returns an error message if the payload is invalid, otherwise an empty string. */
export function validateRsvpPayload(payload) {
  if (!payload.fullName) return "Por favor escribe tu nombre completo.";
  if (!["yes", "no"].includes(payload.attendance)) {
    return "Selecciona si podrás acompañarnos.";
  }
  return "";
}

/** Persists the response locally as a graceful fallback when no backend exists. */
async function saveLocally(payload) {
  const responses = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
  responses.push(payload);
  localStorage.setItem(localStorageKey, JSON.stringify(responses));
  console.warn(
    "VITE_RSVP_ENDPOINT no está configurado: la respuesta se guardó solo en localStorage."
  );
  return { ok: true, local: true };
}

/**
 * Sends the payload to Apps Script, which records the row and notifies admins.
 * Uses text/plain to avoid a CORS preflight that the Apps Script web app would
 * not answer. Throws on network or server errors so the UI can show feedback.
 */
export async function submitRsvpPayload(payload) {
  if (!rsvpEndpoint) return saveLocally(payload);

  let response;
  try {
    response = await fetch(rsvpEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
  } catch (networkError) {
    throw new Error(`No se pudo conectar con el servidor: ${networkError.message}`, {
      cause: networkError,
    });
  }

  if (!response.ok) {
    throw new Error(`El servidor respondió con el estado ${response.status}.`);
  }

  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.error || "El servidor rechazó la confirmación.");
  }

  return result;
}

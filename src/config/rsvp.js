// Apps Script web app URL. Configure it in .env (see .env.example).
// The email recipient list lives server-side in google-apps-script/Code.gs.
export const rsvpEndpoint = import.meta.env.VITE_RSVP_ENDPOINT || "";

// Human-readable labels reused by the form and the RSVP payload.
export const attendanceLabels = {
  yes: "Sí asistirá",
  no: "No podrá asistir",
};

export const ageRangeLabels = {
  child: "Niño",
  young: "Joven",
  adult: "Adulto",
};

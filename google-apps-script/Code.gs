/**
 * quinces RSVP backend (Google Apps Script).
 *
 * Responsibilities, all handled in a single `doPost` request from the website:
 *   1. Append the guest's answer as a new row in the "Confirmaciones" sheet.
 *   2. Send an elegant HTML notification email to every administrator.
 *
 * Deploy: Implementar > Nueva implementación > Aplicación web
 *   - Ejecutar como: tu cuenta.
 *   - Quién tiene acceso: Cualquier usuario.
 * Then copy the URL ending in `/exec` into VITE_RSVP_ENDPOINT (frontend .env).
 */

/* ------------------------------------------------------------------ */
/* Configuration — edit these values, nothing else is required.        */
/* ------------------------------------------------------------------ */

// Recipients of the notification email. Add or remove freely.
const NOTIFICATION_EMAILS = [
  "anamaria15.site@gmail.com",
  // "correo2@gmail.com",
  // "correo3@gmail.com",
];

// Tab name inside the spreadsheet. Created automatically if missing.
const SHEET_NAME = "Confirmaciones";

// Branding used in the email.
const QUINCEANERA_NAMES = "Daniela & Michael";
const quinces_DATE_LABEL = "11 de diciembre de 2026";
const TIMEZONE = "America/Bogota";

// Column order. This is the single source of truth for the sheet layout;
// the header row is written automatically the first time the sheet is empty.
const SHEET_HEADERS = [
  "Fecha de registro",
  "Asistencia",
  "Nombre completo",
  "Teléfono",
  "Rango de edad",
  "Restricciones alimentarias",
  "Mensaje",
  "Fecha del dispositivo",
  "Origen",
];

/* ------------------------------------------------------------------ */
/* HTTP handlers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Handles RSVP submissions sent by the website.
 * The frontend posts JSON as text/plain to avoid a CORS preflight request.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Solicitud vacía o sin cuerpo.");
    }

    const data = JSON.parse(e.postData.contents);
    const errorMessage = validatePayload_(data);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    // Critical step: persisting the answer. If this fails, the whole request fails.
    appendRsvpRow_(data);

    // Best-effort step: notifying admins. A mail failure must NOT discard a
    // valid RSVP, so we report it without failing the request.
    let emailSent = false;
    try {
      sendNotificationEmail_(data);
      emailSent = true;
    } catch (mailError) {
      console.error("No se pudo enviar el correo de notificación:", mailError);
    }

    return jsonResponse_({ ok: true, emailSent: emailSent });
  } catch (error) {
    console.error("doPost error:", error);
    return jsonResponse_({ ok: false, error: error.message });
  }
}

/** Simple health check so the endpoint can be opened in a browser. */
function doGet() {
  return jsonResponse_({ ok: true, service: "quinces-rsvp", status: "ready" });
}

/* ------------------------------------------------------------------ */
/* Sheet handling                                                       */
/* ------------------------------------------------------------------ */

/** Returns the target sheet, creating it (with headers) if it does not exist. */
function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  // Write the header row the first time the sheet is empty.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/** Appends one row per submission. Existing rows are never overwritten. */
function appendRsvpRow_(data) {
  const sheet = getSheet_();
  const attending = data.attendance === "yes";

  sheet.appendRow([
    formatDate_(new Date()),
    safeCell_(data.attendanceLabel || data.attendance),
    safeCell_(data.fullName),
    safeCell_(data.phone),
    attending ? safeCell_(data.ageRangeLabel || data.ageRange) : "",
    attending ? safeCell_(data.dietary) : "",
    safeCell_(data.message),
    safeCell_(data.createdAt),
    safeCell_(data.source),
  ]);
}

/* ------------------------------------------------------------------ */
/* Email notification                                                   */
/* ------------------------------------------------------------------ */

/** Sends the HTML notification to every configured recipient. */
function sendNotificationEmail_(data) {
  const recipients = NOTIFICATION_EMAILS.filter(function (email) {
    return email && email.indexOf("@") !== -1;
  });

  if (recipients.length === 0) {
    throw new Error("No hay destinatarios configurados en NOTIFICATION_EMAILS.");
  }

  const attending = data.attendance === "yes";
  const subject =
    (attending ? "✅ Nueva confirmación" : "❌ No podrá asistir") +
    " · " +
    (data.fullName || "Invitado") +
    " — " +
    QUINCEANERA_NAMES;

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    htmlBody: buildEmailHtml_(data),
    name: QUINCEANERA_NAMES + " · RSVP",
  });
}

/**
 * Builds a responsive, table-based HTML email with inline styles.
 * Table layout + inline CSS is what renders reliably across Gmail/Outlook.
 */
function buildEmailHtml_(data) {
  const attending = data.attendance === "yes";
  const accent = attending ? "#4A668C" : "#9a5b4f";
  const statusText = data.attendanceLabel || (attending ? "Sí asistirá" : "No podrá asistir");

  const rows = [
    detailRow_("Nombre completo", data.fullName),
    detailRow_("Teléfono", data.phone),
  ];

  if (attending) {
    rows.push(detailRow_("Rango de edad", data.ageRangeLabel || data.ageRange));
    rows.push(detailRow_("Restricciones alimentarias", data.dietary));
  }

  rows.push(detailRow_("Mensaje para la pareja", data.message));
  rows.push(detailRow_("Fecha de registro", formatDate_(new Date())));

  return [
    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background:#f1ece1;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1ece1;padding:24px 12px;">',
    '<tr><td align="center">',

    // Card
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#faf6ed;border:1px solid #e2d4b4;border-radius:14px;overflow:hidden;font-family:Georgia,\'Times New Roman\',serif;">',

    // Header band
    '<tr><td style="background:' + accent + ';padding:34px 24px;text-align:center;">',
    '<p style="margin:0;color:#ead8ad;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Confirmación de asistencia</p>',
    '<h1 style="margin:10px 0 4px;color:#ffffff;font-size:30px;font-weight:normal;">' + escapeHtml_(QUINCEANERA_NAMES) + "</h1>",
    '<p style="margin:0;color:#f2e8d4;font-size:14px;letter-spacing:1px;">' + escapeHtml_(quinces_DATE_LABEL) + "</p>",
    "</td></tr>",

    // Status pill
    '<tr><td style="padding:28px 28px 8px;text-align:center;">',
    '<span style="display:inline-block;background:' + accent + ';color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;padding:9px 20px;border-radius:999px;">' +
      escapeHtml_(statusText) +
      "</span>",
    "</td></tr>",

    // Details table
    '<tr><td style="padding:12px 28px 8px;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rows.join("") + "</table>",
    "</td></tr>",

    // Footer
    '<tr><td style="padding:20px 28px 30px;text-align:center;border-top:1px solid #ecdfc2;">',
    '<p style="margin:0;color:#9c8a63;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;">Notificación automática · Invitación digital de boda</p>',
    "</td></tr>",

    "</table>",
    "</td></tr></table></body></html>",
  ].join("");
}

/** Renders a single label/value row, skipping empty values. */
function detailRow_(label, value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "";

  return (
    '<tr><td style="padding:10px 0;border-bottom:1px solid #eee2c8;">' +
    '<div style="color:#a98b54;font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">' +
    escapeHtml_(label) +
    "</div>" +
    '<div style="color:#4a4133;font-size:17px;line-height:1.45;">' +
    escapeHtml_(text).replace(/\n/g, "<br>") +
    "</div>" +
    "</td></tr>"
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Validates the minimum required fields before touching the sheet. */
function validatePayload_(data) {
  if (!data || typeof data !== "object") return "Datos inválidos.";
  if (!String(data.fullName || "").trim()) return "Falta el nombre completo.";
  if (data.attendance !== "yes" && data.attendance !== "no") {
    return "Valor de asistencia inválido.";
  }
  return "";
}

/** Prevents spreadsheet formula injection (=, +, -, @ prefixes). */
function safeCell_(value) {
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/** Escapes user content before embedding it in the HTML email. */
function escapeHtml_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Formats a date in the quinces timezone, e.g. "23/06/2026 14:05". */
function formatDate_(date) {
  return Utilities.formatDate(date, TIMEZONE, "dd/MM/yyyy HH:mm");
}

/** Wraps a JSON payload in a Content Service response. */
function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

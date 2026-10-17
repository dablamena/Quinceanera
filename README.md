# Invitacion Web de Quinceañera

Landing page en React para una invitacion digital de quinceañera. Incluye una introduccion animada, informacion del evento, cuenta regresiva, galeria, mapa embebido y formulario de confirmacion de asistencia. La invitación y su contenido han sido personalizados para los 15 años de Ana María Mena Pérez.

## Tecnologias

- React 19
- Vite 8
- CSS nativo
- Google Apps Script para conectar el formulario a Google Sheets y enviar
  correos de notificacion (Google Sheets + MailApp)

## Requisitos

- Node.js 20 o superior
- npm
- Una cuenta de Google si se desea recibir confirmaciones en Google Sheets

## Instalacion

Desde la raiz del proyecto:

```powershell
npm.cmd install
```

## Ejecutar En Desarrollo

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Luego abre:

```text
http://127.0.0.1:5173
```

Para detener el servidor, usa `Ctrl + C` en la consola donde se esta
ejecutando.

## Compilar Para Produccion

```powershell
npm.cmd run build
```

El resultado se genera en la carpeta `dist/`.

Para revisar la compilacion localmente:

```powershell
npm.cmd run preview
```

## Funcionalidades

- Portada vertical con sobre y sello dorado.
- Animacion de apertura a pantalla completa al tocar la invitacion.
- Cuenta regresiva hasta el 11 de diciembre de 2026.
- Secciones de bienvenida, historia, detalles y regalos.
- Galeria navegable de imagenes.
- Mapa embebido de la recepcion y enlace a Google Maps.
- Formulario RSVP con:
  - Confirmacion o rechazo de asistencia.
  - Nombre completo.
  - Telefono.
  - Rango de edad (solo si asiste).
  - Restricciones alimentarias (solo si asiste).
  - Mensaje para la quinceañera.
- En cada envio del formulario, de forma automatica y en una sola peticion:
  - Se agrega una fila nueva en Google Sheets.
  - Se envia un correo HTML de notificacion a los administradores.
- Musica de fondo instrumental con control para activar/desactivar y
  preferencia recordada en `localStorage`.

___Nota:__ Cada asistente debe completar y enviar su propia confirmacion. Si una persona tiene permitido asistir con acompañante, este tambien debera registrar una respuesta independiente en el formulario._

## Informacion Actual Del Evento

- Fecha: 11 de diciembre de 2026, 7 p.m.
- Recepcion: Celebraciones Argento Cristal.
- Direccion: Carrera 81, Av. 80 #34A-137, Medellin, Antioquia.
- Mapa: configurado en la seccion `Ubicacion`.

## Personalizar El Contenido

- Nombres, fecha y textos de cada seccion: `src/components/Invitation.jsx`.
- Sobre, video de apertura y hero: `src/components/Intro.jsx`.
- Cancion de fondo: `public/audio/quinces-background.mp3` (ver `public/audio/README.md`).

## Conectar El Formulario A Google Sheets

Sin configuracion adicional, el formulario guarda respuestas solo en el
`localStorage` del navegador. Para recibir respuestas reales desde cualquier
dispositivo, configura Google Sheets.

### 1. Crear La Hoja

1. Crea una hoja de calculo en Google Sheets.

No necesitas crear la pestana ni los encabezados manualmente: el script crea
la pestana `Confirmaciones` y escribe la fila de encabezados automaticamente la
primera vez que recibe un envio. Las columnas generadas son:

```text
Fecha de registro | Asistencia | Nombre completo | Telefono | Rango de edad | Restricciones alimentarias | Mensaje | Fecha del dispositivo | Origen
```

### 2. Configurar Apps Script

1. En Google Sheets, abre `Extensiones > Apps Script`.
2. Reemplaza el contenido del editor con el archivo:

```text
google-apps-script/Code.gs
```

1. Edita la lista `NOTIFICATION_EMAILS` (al inicio del archivo) con los correos
   que deben recibir las notificaciones. Puedes agregar o quitar destinatarios.
2. Guarda el proyecto.
3. Selecciona `Implementar > Nueva implementacion`.
4. Elige `Aplicacion web`.
5. En `Ejecutar como`, selecciona tu cuenta.
6. En acceso, selecciona `Cualquier usuario`.
7. Autoriza el script (incluye permiso para enviar correos en tu nombre).
8. Copia la URL que termina en `/exec`.

> El envio de correos ocurre en Apps Script (no en el navegador), por lo que la
> lista de destinatarios se configura en `Code.gs`. Si el correo falla, la fila
> en Sheets se guarda igualmente y el invitado ve confirmacion de exito.

### 3. Configurar El Frontend

1. Crea un archivo `.env` en la raiz del proyecto.
2. Usa `.env.example` como base:

```env
VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/TU_ID/exec
```

1. Reinicia el servidor de desarrollo.

Cada envio agregara una fila en la pestana `Confirmaciones`.

## Estructura Del Proyecto

```text
.
├── google-apps-script/
|   └── Code.gs            # Endpoint: registra en Sheets + envia correos
├── public/
|   ├── audio/             # Coloca aqui quinces-background.mp3
|   ├── img/
|   └── favicon.ico
├── src/
|   ├── assets/
|   |   ├── audio/         # (placeholder) la musica vive en public/audio
|   |   ├── img/
|   |   └── vid/
|   ├── components/
|   |   ├── Intro.jsx        # Sobre, video de apertura y hero (carga inmediata)
|   |   ├── Invitation.jsx   # Resto del contenido (carga diferida)
|   |   └── MusicToggle.jsx
|   ├── config/
|   |   ├── rsvp.js        # Endpoint y etiquetas del formulario
|   |   └── audio.js       # Ruta de la musica de fondo
|   ├── hooks/
|   |   └── useBackgroundMusic.js
|   ├── services/
|   |   └── rsvpService.js # Construye, valida y envia el RSVP
|   ├── App.jsx             # Composicion raiz: Intro + Invitation + musica
|   ├── main.jsx
|   └── styles.css
├── .env.example
├── index.html
├── vercel.json
├── package.json
├── vite.config.js
├── eslint.config.js
├── Dockerfile
├── README.md
└── ...
```

## Archivos Principales

- `src/App.jsx`: composicion raiz. Monta `Intro` siempre, y `Invitation` solo
  despues de que el invitado empieza a abrir el sobre (para no competir por
  ancho de banda con el video de apertura).
- `src/components/Intro.jsx`: sobre, video de apertura, hero y navegacion.
- `src/components/Invitation.jsx`: galerias, mapas, regalos y el
  formulario RSVP.
- `src/styles.css`: estilos visuales y responsive.
- `src/config/rsvp.js` / `src/config/audio.js`: variables de entorno y etiquetas.
- `src/services/rsvpService.js`: construye, valida y envia el RSVP.
- `src/hooks/useBackgroundMusic.js`: logica de la musica de fondo.
- `src/components/MusicToggle.jsx`: control para activar/desactivar la musica.
- `src/assets/`: imagenes (`img/`) y video (`vid/`) usados por la invitacion.
- `public/audio/`: ubicacion del MP3 de fondo (`quinces-background.mp3`).
- `google-apps-script/Code.gs`: agrega filas a Google Sheets y envia correos.
- `.env.example`: plantilla para configurar la URL de Apps Script.

## Musica De Fondo

1. Coloca un MP3 instrumental libre de derechos en
   `public/audio/quinces-background.mp3` (ver `public/audio/README.md`).
2. La musica inicia automaticamente; si el navegador bloquea el autoplay,
   arranca tras la primera interaccion del usuario.
3. Se reproduce en bucle, a volumen bajo (~24 %) y mantiene el estado entre
   secciones.
4. El boton flotante permite silenciarla y la preferencia se guarda en
   `localStorage`. Si no hay archivo de audio, el boton no se muestra.

## Notas De Implementacion

- La URL del endpoint no se debe escribir directamente en `App.jsx`; usa
  siempre la variable `VITE_RSVP_ENDPOINT`.
- El archivo `.env` no debe subirse a un repositorio publico.
- El script de Google protege las celdas frente a valores que comienzan con
  caracteres interpretables como formulas.
- Para cambiar la fecha de la cuenta regresiva, modifica `quincesDate` en
  `src/components/Invitation.jsx`.

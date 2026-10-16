import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Honor a port assigned via the PORT env var (used by the preview harness);
    // falls back to Vite's default when unset.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: "https://anamariaquinces.vercel.app",
    }),
  ],
});

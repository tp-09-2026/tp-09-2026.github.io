import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// GitHub Pages serves a repository named "<org>.github.io" from "/" and any other
// repository from "/<repo>/". The deploy workflow sets BASE_PATH accordingly;
// locally the site always runs from "/".
const base = process.env.BASE_PATH ?? '/';

// Shown in the footer as "Naposledy aktualizované …", so supervisors can see
// when the page was last rebuilt.
const buildDate = new Date().toISOString().slice(0, 10);

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  build: {
    // Never inline PDFs as data: URLs (browsers refuse to open those in a new tab).
    assetsInlineLimit: (filePath) => (filePath.endsWith('.pdf') ? false : undefined),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

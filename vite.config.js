import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      allow: [
        // search up for workspace root
        '.',
        // allow serving files from the artifacts directory
        '/Users/sammyb/.gemini/antigravity-ide/brain/'
      ]
    }
  }
});

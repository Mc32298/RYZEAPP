import path from "path";
import { fileURLToPath } from "url"; // Add this
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron/simple";

const __filename = fileURLToPath(import.meta.url); // Add this
const __dirname = path.dirname(__filename);       // Add this
// https://vitejs.dev/config/
export default defineConfig({
  // Change base to relative paths for Electron
  base: "./", 
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});

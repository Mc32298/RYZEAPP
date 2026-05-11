import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron/simple";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load all env vars from .env (empty prefix = load everything, not just VITE_ prefixed)
  const env = loadEnv(mode, process.cwd(), "");

  // Values that must be baked into the packaged Electron main process bundle.
  // process.env.* is NOT available at runtime in a packaged app, so we inline
  // the values at build time via Vite's define.
  const oauthDefines: Record<string, string> = {
    "process.env.MICROSOFT_OAUTH_CLIENT_ID": JSON.stringify(
      env.MICROSOFT_OAUTH_CLIENT_ID || env.VITE_MICROSOFT_OAUTH_CLIENT_ID || ""
    ),
    "process.env.VITE_MICROSOFT_OAUTH_CLIENT_ID": JSON.stringify(
      env.VITE_MICROSOFT_OAUTH_CLIENT_ID || env.MICROSOFT_OAUTH_CLIENT_ID || ""
    ),
    "process.env.MICROSOFT_OAUTH_TENANT_ID": JSON.stringify(
      env.MICROSOFT_OAUTH_TENANT_ID || "common"
    ),
    "process.env.MICROSOFT_OAUTH_REDIRECT_URI": JSON.stringify(
      env.MICROSOFT_OAUTH_REDIRECT_URI ||
        env.VITE_MICROSOFT_OAUTH_REDIRECT_URI ||
        "http://127.0.0.1:42813/auth/microsoft/callback"
    ),
    "process.env.VITE_MICROSOFT_OAUTH_REDIRECT_URI": JSON.stringify(
      env.VITE_MICROSOFT_OAUTH_REDIRECT_URI ||
        env.MICROSOFT_OAUTH_REDIRECT_URI ||
        "http://127.0.0.1:42813/auth/microsoft/callback"
    ),
    "process.env.MICROSOFT_OAUTH_SCOPE": JSON.stringify(
      env.MICROSOFT_OAUTH_SCOPE ||
        "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read"
    ),
    "process.env.GOOGLE_OAUTH_CLIENT_ID": JSON.stringify(
      env.GOOGLE_OAUTH_CLIENT_ID || ""
    ),
    "process.env.GOOGLE_OAUTH_CLIENT_SECRET": JSON.stringify(
      env.GOOGLE_OAUTH_CLIENT_SECRET || ""
    ),
    "process.env.GOOGLE_OAUTH_REDIRECT_URI": JSON.stringify(
      env.GOOGLE_OAUTH_REDIRECT_URI || "http://127.0.0.1:53682"
    ),
  };

  return {
    base: "./",
    optimizeDeps: {
      entries: ["src/main.tsx", "src/tempobook/**/*"],
    },
    plugins: [
      react(),
      electron({
        main: {
          entry: "electron/main.ts",
          vite: {
            define: oauthDefines,
            build: {
              rollupOptions: {
                external: ["better-sqlite3"],
              },
            },
          },
        },
        preload: {
          input: path.join(__dirname, "electron/preload.ts"),
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
    },
  };
});

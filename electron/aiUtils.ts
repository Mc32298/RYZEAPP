import { app, safeStorage } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { BackendSettings, StoredAiProviderKeys, AiProvider } from "./types";

function resolveUserDataPath() {
  try {
    if (app?.getPath) {
      return app.getPath("userData");
    }
  } catch {
    // Vitest/non-electron runtime fallback.
  }

  return path.join(os.tmpdir(), "ryze-mail-test-data");
}

const settingsFilePath = path.join(resolveUserDataPath(), "ryze-settings.json");
const aiProviderKeysFilePath = path.join(
  resolveUserDataPath(),
  "ai-provider-keys.json",
);

export function loadBackendSettings(): BackendSettings {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      return {} as BackendSettings;
    }

    const parsed = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));
    return typeof parsed === "object" && parsed
      ? (parsed as BackendSettings)
      : {};
  } catch (error) {
    console.error("Failed to load backend settings:", error);
    return {} as BackendSettings;
  }
}

export function loadAiProviderKeys(): StoredAiProviderKeys {
  try {
    if (!fs.existsSync(aiProviderKeysFilePath)) {
      return {};
    }

    const fileContents = fs.readFileSync(aiProviderKeysFilePath, "utf8");
    if (!fileContents) {
      return {};
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure AI key storage is not available on this system");
    }

    const decoded = safeStorage.decryptString(
      Buffer.from(fileContents, "base64"),
    );
    return JSON.parse(decoded) as StoredAiProviderKeys;
  } catch (error) {
    console.error("Failed to load stored AI provider keys:", error);
    return {};
  }
}

export function getGeminiApiKey() {
  const storedKey = loadAiProviderKeys().gemini?.apiKey?.trim();
  const apiKey = storedKey || process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Add it in Settings > AI & keys.",
    );
  }

  return apiKey;
}

export function getGeminiModel() {
  const rawModel =
    loadBackendSettings().geminiModel ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-2.5-flash";

  return rawModel.replace(/^models\//, "");
}

export function getAiProvider() {
  const provider = loadBackendSettings().aiProvider;
  return provider === "ollama" ? "ollama" : "gemini";
}

export function getOllamaConfig() {
  const settings = loadBackendSettings();
  const baseUrl = (settings.ollamaBaseUrl || "http://127.0.0.1:11434").trim();
  const model = (settings.ollamaModel || "llama3.2").trim();

  if (!model) {
    throw new Error("Ollama model is missing. Add it in Settings > AI & keys.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error("Ollama server URL is invalid.");
  }

  const isLocalHost =
    parsedUrl.hostname === "localhost" ||
    parsedUrl.hostname === "127.0.0.1" ||
    parsedUrl.hostname === "::1";

  if (parsedUrl.protocol !== "http:" || !isLocalHost) {
    throw new Error("Ollama server URL must be a local http URL.");
  }

  return {
    baseUrl: parsedUrl.origin,
    model,
  };
}

export function getGeminiApiVersion() {
  return process.env.GEMINI_API_VERSION?.trim() || "v1";
}

export function getAiProviderKeyStatus(provider: AiProvider) {
  const stored = loadAiProviderKeys()[provider];
  const environmentKey =
    provider === "gemini" ? process.env.GEMINI_API_KEY?.trim() : "";

  return {
    provider,
    configured: Boolean(stored?.apiKey || environmentKey),
    source: stored?.apiKey ? "local" : environmentKey ? "environment" : null,
    updatedAt: stored?.updatedAt || null,
    encryptionAvailable: safeStorage.isEncryptionAvailable(),
  };
}

import React, { useRef, useEffect, useCallback } from "react";

interface SandboxedEmailFrameProps {
  html: string;
  isDarkMode: boolean;
  className?: string;
}

function buildSrcdoc(html: string, isDarkMode: boolean): string {
  const fg = isDarkMode ? "#e5e5e5" : "#1f1f1f";
  const linkColor = isDarkMode ? "#A8C7A2" : "#8B6F5A";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="color-scheme" content="${isDarkMode ? "dark" : "light"}">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { background: transparent; }
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: ${fg};
  word-break: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
}
/* Strip explicit heights from layout elements so email templates don't add blank space */
html, body,
table, tbody, thead, tfoot, tr,
div, section, article, main, header, footer, aside, center, blockquote {
  height: auto !important;
  min-height: 0 !important;
}
a { color: ${linkColor}; }
img { max-width: 100%; height: auto; display: block; }
table { border-collapse: collapse; max-width: 100%; }
pre, code { white-space: pre-wrap; }
</style>
</head>
<body>${html}</body>
</html>`;
}

function isOpenableEmailLink(href: string): boolean {
  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "mailto:";
  } catch {
    return false;
  }
}

function measureContentHeight(doc: Document): number {
  // Walk every element and find the actual bottom of the last rendered piece of
  // content. This is more accurate than scrollHeight because scrollHeight still
  // includes explicitly-sized elements (e.g. <table height="800">) even when
  // their visible content is much shorter.
  let maxBottom = 0;
  doc.body.querySelectorAll("*").forEach((el) => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    if (rect.bottom > maxBottom) maxBottom = rect.bottom;
  });
  return Math.max(maxBottom, 32);
}

export function SandboxedEmailFrame({
  html,
  isDarkMode,
  className,
}: SandboxedEmailFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const onLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    doc.addEventListener("click", (e) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (!isOpenableEmailLink(href)) return;
      window.open(href);
    });

    const resize = () => {
      if (!iframe || !doc.body) return;
      iframe.style.height = `${measureContentHeight(doc)}px`;
    };

    roRef.current?.disconnect();
    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(doc.body);
    resize();

    // Re-measure whenever any image inside the email finishes loading (or fails).
    // Without this, images that haven't loaded yet have height 0 at onLoad time,
    // so the iframe is sized too short and expands as each image loads.
    doc.querySelectorAll("img").forEach((img) => {
      if (!(img as HTMLImageElement).complete) {
        img.addEventListener("load", resize, { once: true });
        img.addEventListener("error", resize, { once: true });
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      roRef.current?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-same-origin"
      srcDoc={buildSrcdoc(html, isDarkMode)}
      onLoad={onLoad}
      className={className}
      style={{ width: "100%", border: "none", display: "block", minHeight: "2em" }}
      title="Email content"
    />
  );
}

import React, { useRef, useEffect, useCallback } from "react";

interface SandboxedEmailFrameProps {
  html: string;
  isDarkMode: boolean;
  className?: string;
}

function buildSrcdoc(html: string, isDarkMode: boolean): string {
  const fg = isDarkMode ? "#e5e5e5" : "#1f1f1f";
  const linkColor = isDarkMode ? "#C9A84C" : "#8B5E1A";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="color-scheme" content="${isDarkMode ? "dark" : "light"}">
<style>
*, *::before, *::after { box-sizing: border-box; }
html { background: transparent; }
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: ${fg};
  background: transparent;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
}
a { color: ${linkColor}; }
img { max-width: 100%; height: auto; }
table { border-collapse: collapse; max-width: 100%; }
pre, code { white-space: pre-wrap; }
</style>
</head>
<body>${html}</body>
</html>`;
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

    // Intercept clicks in the iframe from the parent context (possible because of
    // allow-same-origin). Prevents the iframe from navigating and routes all links
    // through Electron's setWindowOpenHandler → shell.openExternal.
    doc.addEventListener("click", (e) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // Let in-page fragment links be (they scroll within the fixed-height iframe)
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      // window.open is caught by Electron's setWindowOpenHandler which calls
      // shell.openExternal for https: / mailto: and denies everything else.
      window.open(href);
    });

    // Auto-resize the iframe to its full content height so no internal scroll bar
    // appears and the email body is fully visible in the app's own scroll container.
    const resize = () => {
      if (iframe && doc.documentElement) {
        iframe.style.height = `${doc.documentElement.scrollHeight}px`;
      }
    };

    roRef.current?.disconnect();
    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(doc.body);
    resize();
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

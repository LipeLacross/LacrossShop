import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { ThemeProvider } from "@/theme/ThemeProvider";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

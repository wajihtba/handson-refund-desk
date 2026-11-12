import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import { App } from "./App"
import { BASE } from "./api"
import "./styles.css"

// The web app's entry point. Provided.
// The router's basename is Vite's base: "/" on your laptop, the preview
// path in the lab (see vite.config.ts).

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={BASE.replace(/\/$/, "") || "/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

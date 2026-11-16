import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// Hold the first paint until the webfonts are in (index.html starts them),
// so text is drawn once and never re-wraps. The wait is capped: on a slow
// font server the page shows in the fallback fonts instead of staying blank.
const FONT_WAIT_MS = 700;
const fontsReady = window.__fontsReady ?? Promise.resolve();
const fontWaitOver = new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS));

Promise.race([fontsReady, fontWaitOver]).then(() => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
});

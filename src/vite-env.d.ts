/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_INTAKE_ENDPOINT?: string;
  /** "1" = the dev server really sends applications. Anything else: it only logs a preview. */
  readonly VITE_INTAKE_SEND_IN_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Set by the font script in index.html: settles when the webfonts are in. */
  __fontsReady?: Promise<unknown>;
}

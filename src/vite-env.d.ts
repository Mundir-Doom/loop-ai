/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_OPENROUTER_REFERER?: string;
  readonly VITE_OPENROUTER_TITLE?: string;
  readonly VITE_GOOGLE_SHEETS_API_KEY?: string;
  readonly VITE_GOOGLE_SHEET_ID?: string;
  readonly VITE_GOOGLE_SHEET_RANGE?: string;
  readonly VITE_TELEGRAM_BOT_TOKEN?: string;
  readonly VITE_TELEGRAM_CHAT_ID?: string;
  readonly REACT_APP_OPENROUTER_API_KEY?: string;
  readonly REACT_APP_OPENROUTER_REFERER?: string;
  readonly REACT_APP_OPENROUTER_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

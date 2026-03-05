/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CALENDLY_URL: string;
  readonly VITE_LEAD_WEBHOOK_URL: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

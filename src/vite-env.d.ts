/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CALENDLY_URL: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_ADS_BOOKING_SEND_TO: string;
  readonly VITE_LINKEDIN_BOOKING_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const src: string;
  export default src;
}

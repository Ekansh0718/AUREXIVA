/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  readonly VITE_PAYMENT_PROVIDER?: string;
  readonly VITE_PAYMENT_ENV?: string;
  readonly VITE_PAYMENT_MERCHANT_ID?: string;
  readonly VITE_PAYMENT_PUBLIC_KEY?: string;
  readonly VITE_PAYMENT_GATEWAY_URL?: string;
  readonly VITE_PAYMENT_CALLBACK_URL?: string;
  readonly VITE_PAYMENT_RETURN_URL?: string;
  readonly VITE_PAYMENT_SUCCESS_URL?: string;
  readonly VITE_PAYMENT_FAILURE_URL?: string;
  readonly VITE_PAYMENT_CURRENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

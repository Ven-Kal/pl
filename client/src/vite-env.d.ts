/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_GA_TRACKING_ID: string;
    // Add any other environment variables you use
    readonly [key: string]: string;
  };
}
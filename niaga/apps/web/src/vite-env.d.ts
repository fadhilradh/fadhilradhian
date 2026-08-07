/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Fastify API. Set per Netlify context in netlify.toml. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

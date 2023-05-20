/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />

declare interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_SIMULATE_NET_DELAY: string;
    readonly VITE_X_HTTP_METHOD_OVERRIDEE: string;
    readonly VITE_REQUEST_BASE_SCHEME: string;
    readonly VITE_REQUEST_BASE_HOST: string;
    readonly VITE_REQUEST_BASE_PORT: string;
    readonly VITE_REQUEST_BASE_URL: string;
}

declare interface ImportMeta {
    readonly env: ImportMetaEnv;
}

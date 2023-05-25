/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />

// Reactivity Transform
// https://vue-macros.sxzz.moe/zh-CN/features/reactivity-transform.html#typescript-integration
/// <reference types="@vue-macros/reactivity-transform/macros-global" />

declare interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_SIMULATE_NET_DELAY: string;
    readonly VITE_X_HTTP_METHOD_OVERRIDEE: string;
    readonly VITE_REQUEST_BASE_SCHEME: string;
    readonly VITE_REQUEST_BASE_HOST: string;
    readonly VITE_REQUEST_BASE_PORT: string;
    readonly VITE_REQUEST_BASE_URL: string;
    /** 文件上传的地址 */
    readonly VITE_UPLOAD_URL: string;
    /** 文件最大上传数 */
    readonly VITE__MAX_UPLOADINGS: number;
}

declare interface ImportMeta {
    readonly env: ImportMetaEnv;
}

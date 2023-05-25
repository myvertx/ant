/** 请求基础URL的协议部分 */
export const requestBaseScheme = import.meta.env.VITE_REQUEST_BASE_SCHEME;
/** 请求基础URL的主机部分 */
export const requestBaseHost = import.meta.env.VITE_REQUEST_BASE_HOST;
/** 请求基础URL的端口号部分 */
export const requestBasePort = import.meta.env.VITE_REQUEST_BASE_PORT;
/** 请求基础URL */
export const requestBaseUrl = (function () {
    // 如果不自定义，直接返回base项设置的URL(https://cn.vitejs.dev/config/#base)
    if (!import.meta.env.VITE_REQUEST_CUSTOMIZE) {
        return '';
    }

    // 自定义往下走
    // 端口号
    const port = import.meta.env.VITE_REQUEST_BASE_PORT ? ':' + import.meta.env.VITE_REQUEST_BASE_PORT : '';
    // 返回自定义拼接
    return (
        import.meta.env.VITE_REQUEST_BASE_SCHEME +
        '://' +
        import.meta.env.VITE_REQUEST_BASE_HOST +
        port +
        import.meta.env.VITE_REQUEST_BASE_URL
    );
})();

console.log('requestBaseUrl', requestBaseUrl);

/** 是否模拟网络延迟 */
export const isSimulateNetDelay: boolean = JSON.parse(import.meta.env.VITE_SIMULATE_NET_DELAY);

/** 是否开启将delete、put等请求转换为post请求 */
export const xHttpMethodOverride: boolean = import.meta.env.VITE_X_HTTP_METHOD_OVERRIDE
    ? JSON.parse(import.meta.env.VITE_X_HTTP_METHOD_OVERRIDE)
    : false;

/**  文件上传的地址 */
export const uploadUrl = import.meta.env.VITE_UPLOAD_URL;
/** 文件最大上传数 */
export const maxUploadings = import.meta.env.VITE__MAX_UPLOADINGS - 0;

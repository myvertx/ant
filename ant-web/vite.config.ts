import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { themePreprocessorPlugin } from '@zougt/vite-plugin-theme-preprocessor';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
// mode:
//      命令 vite 的 mode 为 development
//      命令 vite build 的 mode 为 production
//      如果想自定义mode，运行命令 vite build --mode <自定义mode名称>
export default defineConfig(({ command, mode, ssrBuild }) => {
    // 根据当前工作目录中的 `mode` 加载 .env 文件
    // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: env.VITE_BASE_URL,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        plugins: [
            vue({}),
            // 自动加载组件
            Components({
                // 查找自定义组件的位置
                dirs: ['src/component', 'src/view'],
                resolvers: [
                    // and design vue组件
                    AntDesignVueResolver(),
                ],
            }),
            // 自动导入vue3等常用API的hooks
            AutoImport({
                // targets to transform
                include: [
                    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                    /\.vue$/,
                    /\.vue\?vue/, // .vue
                    /\.md$/, // .md
                ],
                // global imports to register
                imports: [
                    // presets
                    'vue',
                    // 本项目没有用到vue-router，先注释起来
                    // {
                    //     'vue-router': [
                    //         'createRouter',
                    //         'createWebHashHistory',
                    //         'onBeforeRouteLeave',
                    //         'onBeforeRouteUpdate',
                    //     ],
                    // },
                    'pinia',
                    {
                        axios: [
                            // default imports
                            ['default', 'axios'], // import { default as axios } from 'axios',
                        ],
                    },
                ],
                dts: true,
            }),
            // 创建动态主题切换
            themePreprocessorPlugin({
                less: {
                    // 是否启用任意主题色模式，这里不启用
                    arbitraryMode: false,
                    // 提供多组变量文件
                    multipleScopeVars: [
                        {
                            scopeName: 'theme-default',
                            // 变量文件内容不应该夹带样式代码，设定上只需存在变量
                            path: path.resolve('src/assets/theme/default.less'),
                        },
                        {
                            scopeName: 'theme-dark',
                            path: path.resolve('src/assets/theme/dark.less'),
                        },
                    ],
                    // 默认取 multipleScopeVars[0].scopeName
                    defaultScopeName: 'theme-dark',
                },
            }),
        ],
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                },
            },
        },
    };
});

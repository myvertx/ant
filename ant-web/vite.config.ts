import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import { themePreprocessorPlugin, themePreprocessorHmrPlugin } from '@zougt/vite-plugin-theme-preprocessor';
import { themePreprocessorPlugin } from '@zougt/vite-plugin-theme-preprocessor';
import path from 'path';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import AutoImport from 'unplugin-auto-import/vite';
import ReactivityTransform from '@vue-macros/reactivity-transform/vite';

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
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                },
                scss: {
                    additionalData: `@use "element-plus/theme-chalk/src/common/var.scss" as *;`,
                },
            },
        },
        plugins: [
            vue({}),
            // Reactivity Transform
            // https://vue-macros.sxzz.moe/zh-CN/features/reactivity-transform.html
            ReactivityTransform(),
            // 自动加载组件
            Components({
                // 查找自定义组件的位置
                dirs: ['src/icon', 'src/component', 'src/view'],
                resolvers: [
                    // // Auto register and design vue
                    // AntDesignVueResolver(),
                    // Auto register element plus
                    ElementPlusResolver({
                        importStyle: 'sass',
                    }),
                    // Auto register icon components
                    // 自动注册图标组件
                    IconsResolver({
                        enabledCollections: ['ep'],
                    }),
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
                resolvers: [
                    // // Auto import and design vue
                    // AntDesignVueResolver(),
                    // Auto import element plus
                    ElementPlusResolver(),
                    // Auto import icon components
                    // 自动导入图标组件
                    IconsResolver({
                        prefix: 'Icon',
                    }),
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
            // 创建动态主题切换 https://github.com/GitOfZGT/vite-plugin-theme-preprocessor/blob/master/README.zh.md
            themePreprocessorPlugin({
                scss: {
                    // 是否启用任意主题色模式，这里不启用
                    arbitraryMode: false,
                    // 提供多组变量文件
                    multipleScopeVars: [
                        {
                            scopeName: 'default',
                            // 变量文件内容不应该夹带样式代码，设定上只需存在变量
                            path: path.resolve('src/assets/theme/default.scss'),
                        },
                        {
                            scopeName: 'dark',
                            path: path.resolve('src/assets/theme/dark.scss'),
                        },
                    ],
                    // css中不是由主题色变量生成的颜色，也让它抽取到主题css内，可以提高权重
                    // includeStyleWithColors: [
                    //     {
                    //         color: '#ffffff',
                    //         // 此类颜色的是否跟随主题色梯度变化，默认false
                    //         // inGradient: true,
                    //     },
                    // ],
                    // 默认取 multipleScopeVars[0].scopeName
                    defaultScopeName: 'dark',
                    // 在生产模式是否抽取独立的主题css文件，extract为true以下属性有效
                    extract: true,
                    // 独立主题css文件的输出路径，默认取 viteConfig.build.assetsDir 相对于 (viteConfig.build.outDir)
                    outputDir: '',
                    // 会选取defaultScopeName对应的主题css文件在html添加link
                    themeLinkTagId: 'theme-link-tag',
                    // "head"||"head-prepend" || "body" ||"body-prepend"
                    themeLinkTagInjectTo: 'head',
                    // 是否对抽取的css文件内对应scopeName的权重类名移除
                    removeCssScopeName: false,
                    // 可以自定义css文件名称的函数
                    customThemeCssFileName: (scopeName) => scopeName,
                },
            }),
            // // 创建动态主题切换 https://github.com/GitOfZGT/vite-plugin-theme-preprocessor/blob/master/README.zh.md
            // themePreprocessorPlugin({
            //     less: {
            //         // 提供多组变量文件
            //         multipleScopeVars: [
            //             {
            //                 scopeName: 'default',
            //                 // 变量文件内容不应该夹带样式代码，设定上只需存在变量
            //                 path: path.resolve('src/assets/theme/default.less'),
            //             },
            //             {
            //                 scopeName: 'dark',
            //                 // 变量文件内容不应该夹带样式代码，设定上只需存在变量
            //                 path: path.resolve('src/assets/theme/dark.less'),
            //             },
            //         ],
            //         // 默认取 multipleScopeVars[0].scopeName
            //         defaultScopeName: 'dark',
            //     },
            // }),
            // // 主题热更新，不得已分开插件，因为需要vite插件顺序enforce
            // themePreprocessorHmrPlugin(),
        ],
    };
});

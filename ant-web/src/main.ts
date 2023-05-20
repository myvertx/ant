import App from './App.vue';
import 'ant-design-vue/es/message/style/css';
import 'ant-design-vue/dist/antd.less';
import { ModuleNamespace } from 'node_modules/vite/types/hot';

const app = createApp(App);
app.use(createPinia());

// 导入自定义插件
const modules = import.meta.glob('@/plugin/*.ts', { eager: true });
Object.values(modules).forEach((module) => {
    app.use((module as ModuleNamespace).default);
});

app.mount('#app');

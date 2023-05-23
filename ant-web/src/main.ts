import App from './App.vue';
// import 'ant-design-vue/es/message/style/css';
import './style.less';
import { ModuleNamespace } from 'node_modules/vite/types/hot';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// 导入自定义插件
const modules = import.meta.glob('@/plugin/*.ts', { eager: true });
Object.values(modules).forEach((module) => {
    app.use((module as ModuleNamespace).default);
});

app.mount('#app');

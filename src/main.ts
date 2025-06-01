import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import App from './App.vue'

// PrimeVue stil dosyaları
import './style.css'
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Router yapılandırması
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tracker'
    },
    {
      path: '/tracker',
      component: () => import('./views/Tracker.vue')
    },
    {
      path: '/my-assets',
      component: () => import('./views/MyAssets.vue')
    }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)

app.mount('#app')

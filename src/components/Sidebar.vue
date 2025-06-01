<script setup lang="ts">
import { useRoute } from 'vue-router'
import Sidebar from 'primevue/sidebar';
import Button from 'primevue/button';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  'update:isSidebarOpen': [value: boolean]
}>()

const route = useRoute()
const isMobile = ref(false)

const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
};

const checkScreen = debounce(() => {
    isMobile.value = window.innerWidth < 768
    if (!isMobile.value) {
        emit('update:isSidebarOpen', true)
    }
})

onMounted(() => {
    checkScreen()
    window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkScreen)
})

const isActive = (path: string) => route.path === path
</script>

<template>
<div>
  <Sidebar v-model:visible="props.isSidebarOpen" 
          :class="{'w-full': isMobile, '!w-[260px] !border-0': !isMobile}" 
          :modal="isMobile"
          :dismissable="isMobile"
          :showCloseIcon="isMobile"
          @update:visible="(val: boolean) => emit('update:isSidebarOpen', val)"
          class="shadow-2xl">
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <span class="flex items-center gap-3">
                  <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="..." fill="var(--primary-color-color)" />
                      <path d="..." fill="var(--text-color)" />
                  </svg>
                  <span class="font-bold text-xl text-gray-800 dark:text-white">Crypto Case</span>
              </span>
              <span v-if="isMobile">
                  <Button type="button" 
                         @click="closeCallback" 
                         icon="pi pi-times" 
                         class="p-button-rounded p-button-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" />
              </span>
          </div>
          <div class="flex-1 overflow-y-auto">
            <nav class="p-4">
              <ul class="space-y-2">
                <li>
                    <router-link :to="'/tracker'" 
                               :class="{ 'bg-primary-50 text-primary-700': isActive('/tracker') }"
                               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                        <i class="pi pi-chart-line text-lg"></i>
                        <span class="font-medium">Tracker</span>
                    </router-link>
                </li>
                <li>
                    <router-link :to="'/my-assets'"
                               :class="{ 'bg-primary-50 text-primary-700': isActive('/my-assets') }"
                               class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                        <i class="pi pi-wallet text-lg"></i>
                        <span class="font-medium">My Assets</span>
                    </router-link>
                </li>
              </ul>
            </nav>
          </div>
      </div>
    </template>
  </Sidebar>
</div>
</template>

<style scoped>
:deep(.p-sidebar) {
  @apply  border-0;
}

@media screen and (min-width: 768px) {
  :deep(.p-sidebar) {
    @apply fixed left-0 top-0;
    transform: none !important;
    visibility: visible !important;
  }
}
</style>


<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isSidebarOpen = ref(false)
const isMobile = ref(window.innerWidth < 768)

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      isSidebarOpen.value = false
    }
  }
)

const checkScreen = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})
</script>

<template>
  <div class="relative flex min-h-screen">
    <Toast />
    <Sidebar 
      v-model:isSidebarOpen="isSidebarOpen"
      :class="{ 
        'md:w-64 md:translate-x-0': true,
        'w-full translate-x-0': isSidebarOpen,
        'w-0 -translate-x-full': !isSidebarOpen
      }"
      class="fixed md:relative transition-all duration-300 ease-in-out z-20"
    />
    
    <!-- Main Content -->
    <div class="flex flex-col flex-1">
      <!-- Header -->
       <div class="flex items-center justify-between p-4 md:p-6 bg-white shadow-sm">
        <p class="text-xl font-semibold">Crypto Case</p>
        <Button v-if="isMobile" 
               icon="pi pi-bars" 
               @click="isSidebarOpen = !isSidebarOpen"
               class="p-button-text" />
       </div>

      <main class="flex-1 transition-all duration-300 ease-in-out">
        <div>
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.sidebar-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-10;
}
</style>

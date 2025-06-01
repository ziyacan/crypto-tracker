<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Crypto Pariteleri</h1>
      <Button
        label="Satın Al"
        icon="pi pi-shopping-cart"
        :disabled="!selectedPairs.length"
        @click="showBuyDialog = true"
        class="p-button-success"
      />
    </div>

    <Toast position="top-right" />

    <DataTable
      v-model:selection="selectedPairs"
      :value="filteredAndSortedPairs"
      dataKey="symbol"
      :paginator="true"
      :rows="10"
      :loading="loading"
      class="p-datatable-sm"
      :sortField="sortField"
      :sortOrder="sortOrder"
      @sort="onSort"
      responsiveLayout="scroll"
      :rowHover="true"
      emptyMessage="Veri yükleniyor..."
      stripedRows
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['symbol']"
      :rowsPerPageOptions="[10, 20, 50]"
      :totalRecords="filteredAndSortedPairs.length"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    >
      <template #paginatorstart>
        <div class="text-sm text-gray-600">
          Toplam {{ filteredAndSortedPairs.length }} parite
        </div>
      </template>

      <template #header>
        <div class="flex justify-between">
          <Button
            icon="pi pi-refresh"
            @click="refreshData"
            :loading="refreshing"
            class="p-button-text"
          />
          <InputText v-model="filters['global'].value" placeholder="Ara..." />
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem" />
      <Column field="symbol" header="Parite" sortable>
        <template #body="{ data }">
          <span class="text-blue-600 font-medium">{{ data.symbol }}</span>
        </template>
      </Column>
      <Column field="price" header="Fiyat" sortable>
        <template #body="{ data }">
          <span :class="{ 'price-changed': changedPairs.has(data.symbol) }">
            {{ formatPrice(data.price) }}
          </span>
        </template>
      </Column>
      <Column field="priceChange" header="Değişim" sortable>
        <template #body="{ data }">
          <span :class="getPriceChangeColor(data.priceChange)">
            {{ formatChange(data.priceChange) }}
          </span>
        </template>
      </Column>
      <Column field="volume" header="Hacim" sortable class="hidden lg:table-cell" />
      <Column field="lastUpdate" header="Son Güncelleme" sortable class="hidden lg:table-cell">
        <template #body="{ data }">
          {{ formatTime(data.lastUpdate) }}
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="showBuyDialog"
      header="Satın Al"
      :modal="true"
      :style="{ width: '450px' }"
      class="p-fluid"
      :closable="!processing"
    >
      <div class="space-y-4">
        <div v-for="pair in selectedPairs" :key="pair.symbol" class="field">
          <label :for="pair.symbol" class="block text-gray-700 font-medium mb-2">
            {{ pair.symbol }} Hacim:
          </label>
          <div class="p-inputgroup">
            <InputNumber
              v-model="buyVolumes[pair.symbol]"
              :id="pair.symbol"
              :min="0"
              :step="0.01"
              mode="decimal"
              :minFractionDigits="2"
              :maxFractionDigits="5"
              placeholder="0.00"
              class="w-full"
              :disabled="processing"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="İptal"
            icon="pi pi-times"
            @click="showBuyDialog = false"
            class="p-button-text"
            :disabled="processing"
          />
          <Button
            label="Satın Al"
            icon="pi pi-check"
            @click="handleBuy"
            class="p-button-success"
            :loading="processing"
            :disabled="!isValidPurchase"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAssetsStore } from '../stores/assets'
import { webSocketService } from '../services/websocket.service'
import { formatPrice, formatChange, formatTime } from '../utils/formatters'
import type { CryptoPair, BuyVolume, Asset } from '../types'
import DataTable from 'primevue/datatable'
import type { DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Toolbar from 'primevue/toolbar';

const toast = useToast()
const assetsStore = useAssetsStore()

// State
const loading = ref(true)
const refreshing = ref(false)
const processing = ref(false)
const selectedPairs = ref<CryptoPair[]>([])
const showBuyDialog = ref(false)
const buyVolumes = ref<BuyVolume>({})
const sortField = ref<string>('symbol')
const sortOrder = ref<number>(1)
const changedPairs = ref<Set<string>>(new Set())
const cryptoPairs = ref<CryptoPair[]>([])
const filters = ref({
  global: { value: null as string | null, matchMode: 'contains' }
})

// Computed
const filteredAndSortedPairs = computed(() => {
  let pairs = [...cryptoPairs.value]

  // Global arama filtresi
  const searchTerm = filters.value.global.value
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    pairs = pairs.filter(pair => 
      pair.symbol.toLowerCase().includes(searchLower)
    )
  }

  // Sıralama 
  const field = sortField.value
  const order = sortOrder.value
  if (field) {
    pairs.sort((a, b) => {
      const aValue = a[field as keyof CryptoPair]
      const bValue = b[field as keyof CryptoPair]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order * aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order * (aValue - bValue)
      }
      return 0
    })
  }

  return pairs
})

const isValidPurchase = computed(() => {
  return selectedPairs.value.some((pair: CryptoPair) => {
    const volume = buyVolumes.value[pair.symbol] || 0
    return volume > 0
  })
})

// Methods
const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-500'
  if (change < 0) return 'text-red-500'
  return 'text-gray-600'
}

const onSort = (event: DataTableSortEvent) => {
  if (event.sortField) {
    sortField.value = event.sortField as string
    sortOrder.value = event.sortOrder ?? 1
  }
}

const refreshData = async () => {
  try {
    refreshing.value = true
    // WebSocket bağlantısını yenileme
    webSocketService.disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000))
    initializeWebSocket()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Hata',
      detail: 'Veriler yenilenirken bir hata oluştu',
      life: 3000
    })
  } finally {
    refreshing.value = false
  }
}

const handleBuy = async () => {
  try {
    processing.value = true
    const purchases = selectedPairs.value
      .map((pair: CryptoPair) => ({
        symbol: pair.symbol,
        purchasePrice: pair.price,
        currentPrice: pair.price,
        amount: buyVolumes.value[pair.symbol] || 0,
        lastUpdate: Date.now()
      }))
      .filter((purchase: Asset) => purchase.amount > 0)

    for (const purchase of purchases) {
      await assetsStore.addAsset(purchase)
    }

    toast.add({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Satın alma işlemi tamamlandı',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Hata',
      detail: 'Satın alma işlemi sırasında bir hata oluştu',
      life: 3000
    })
  } finally {
    processing.value = false
    showBuyDialog.value = false
    selectedPairs.value = []
    buyVolumes.value = {}
  }
}

const handleWebSocketMessage = (data: CryptoPair[]) => {
  // İlk veri geldiğinde loading'i kaldır
  if (loading.value) {
    loading.value = false
  }

  data.forEach(pair => {
    const index = cryptoPairs.value.findIndex((p: CryptoPair) => p.symbol === pair.symbol)
    if (index >= 0) {
      const oldPrice = cryptoPairs.value[index].price
      if (oldPrice !== pair.price) {
        changedPairs.value.add(pair.symbol)
        setTimeout(() => {
          changedPairs.value.delete(pair.symbol)
        }, 1000)
      }
      cryptoPairs.value[index] = pair
    } else {
      cryptoPairs.value.push(pair)
    }
  })
}

const initializeWebSocket = () => {
  loading.value = true // WebSocket bağlantısı başlatılırken loading'i aktif et
  webSocketService.connect(handleWebSocketMessage)

  // 10 saniye içinde veri gelmezse loading'i kaldır
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      toast.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Veri akışı yavaş olabilir, lütfen bekleyin.',
        life: 3000
      })
    }
  }, 10000)
}

// Bağlantı durumunu izle
watch(() => webSocketService.isConnected, (connected) => {
  if (!connected && !loading.value) {
    loading.value = true
    toast.add({
      severity: 'error',
      summary: 'Bağlantı Hatası',
      detail: 'Sunucu bağlantısı kesildi, yeniden bağlanılıyor...',
      life: 3000
    })
  }
})

// Lifecycle hooks
onMounted(() => {
  initializeWebSocket()
})

onUnmounted(() => {
  webSocketService.disconnect()
})

// Watchers
watch(() => assetsStore.error, (error) => {
  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Hata',
      detail: error,
      life: 3000
    })
    assetsStore.clearError()
  }
})
</script>

<style scoped>
.price-changed {
  @apply bg-green-100 transition-colors duration-500;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-gray-50 text-gray-600 font-medium p-3;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  @apply hover:bg-gray-50 transition-colors duration-200;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  @apply p-3;
}

:deep(.p-dialog-header) {
  @apply bg-gray-50 border-b border-gray-200;
}

:deep(.p-dialog-footer) {
  @apply bg-gray-50 border-t border-gray-200;
}
</style> 
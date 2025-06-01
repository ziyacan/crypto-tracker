<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Varlıklarım</h1>
      <Button
        label="CSV'ye Aktar"
        icon="pi pi-download"
        class="p-button-info"
        @click="exportToCSV"
        :disabled="!assets.length"
      />
    </div>

    <DataTable
      :value="assets"
      :paginator="true"
      :rows="10"
      class="p-datatable-sm"
      emptyMessage="Henüz varlık eklenmemiş..."
      responsiveLayout="stack"
      :rowHover="true"
      stripedRows
    >
      <Column field="symbol" header="Parite" sortable>
        <template #body="{ data }">
          <span class="text-blue-600 font-medium">{{ data.symbol }}</span>
        </template>
      </Column>
      <Column field="purchasePrice" header="Satın Alım Fiyatı" sortable class="hidden lg:table-cell">
        <template #body="{ data }">
          {{ formatPrice(data.purchasePrice) }}
        </template>
      </Column>
      <Column field="amount" header="Adet" sortable>
        <template #body="{ data }">
          {{ formatAmount(data.amount) }}
        </template>
      </Column>
      <Column field="totalValue" header="Toplam Değer" sortable class="hidden lg:table-cell">
        <template #body="{ data }">
          {{ formatPrice((currentPrices[data.symbol] || data.purchasePrice) * data.amount) }}
        </template>
      </Column>
      <Column field="profitLoss" header="Kar/Zarar" sortable>
        <template #body="{ data }">
          <span :class="{
            'text-green-600': getProfitLoss(data) > 0,
            'text-red-600': getProfitLoss(data) < 0,
            'text-gray-600': getProfitLoss(data) === 0,
            'font-medium': true
          }">
            {{ formatProfitLoss(getProfitLoss(data)) }}
          </span>
        </template>
      </Column>
      <Column header="İşlemler" :exportable="false" class="hidden lg:table-cell">
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            class="p-button-danger p-button-text"
            @click="deleteAsset(data.symbol)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAssetsStore } from '../stores/assets'
import { webSocketService } from '../services/websocket.service'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import type { CryptoPair } from '../types'

const assetsStore = useAssetsStore()
const assets = computed(() => assetsStore.assets)
const currentPrices = ref<Record<string, number>>({})

onMounted(() => {
  assetsStore.initializeStore()
  webSocketService.connect((data: CryptoPair[]) => {
    data.forEach(pair => {
      currentPrices.value[pair.symbol] = pair.price
    })
  })
})

onUnmounted(() => {
  webSocketService.disconnect()
})

const getProfitLoss = (asset: { symbol: string; purchasePrice: number }) => {
  const currentPrice = currentPrices.value[asset.symbol]
  if (!currentPrice) return 0
  return ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100
}

const formatPrice = (price: number) => {
  return price.toFixed(5)
}

const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

const formatProfitLoss = (percentage: number) => {
  return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

const deleteAsset = (symbol: string) => {
  assetsStore.removeAsset(symbol)
}

const exportToCSV = () => {
  const csvContent = [
    ['Parite', 'Fiyat', 'Hacim', 'Toplam Değer', 'Kar/Zarar'].join(','),
    ...assets.value.map(asset => [
      asset.symbol,
      formatPrice(asset.purchasePrice),
      formatAmount(asset.amount),
      formatPrice(asset.purchasePrice * asset.amount),
      formatProfitLoss(getProfitLoss(asset))
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `varliklarim-${new Date().toLocaleDateString('tr-TR')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-gray-50 text-gray-600 font-medium p-3;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  @apply hover:bg-gray-50 transition-colors duration-200;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  @apply p-3;
}
</style> 
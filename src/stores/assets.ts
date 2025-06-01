import { defineStore } from 'pinia'
import type { Asset } from '../types'

const STORAGE_KEY = 'crypto-assets'

interface AssetsState {
  assets: Asset[]
  loading: boolean
  error: string | null
}

export const useAssetsStore = defineStore('assets', {
  state: (): AssetsState => ({
    assets: [],
    loading: false,
    error: null
  }),

  actions: {
    async initializeStore() {
      try {
        this.loading = true
        const savedAssets = localStorage.getItem(STORAGE_KEY)
        if (savedAssets) {
          this.assets = JSON.parse(savedAssets)
        }
      } catch (error) {
        this.error = 'Varlıklar yüklenirken hata oluştu'
        console.error('Store başlatma hatası:', error)
      } finally {
        this.loading = false
      }
    },

    async saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assets))
      } catch (error) {
        this.error = 'Varlıklar kaydedilirken hata oluştu'
        console.error('Storage kayıt hatası:', error)
      }
    },

    addAsset(asset: Asset) {
      try {
        const existingAsset = this.assets.find(a => a.symbol === asset.symbol)
        if (existingAsset) {
          const totalOldValue = existingAsset.purchasePrice * existingAsset.amount
          const totalNewValue = asset.purchasePrice * asset.amount
          const totalAmount = existingAsset.amount + asset.amount
          
          existingAsset.purchasePrice = (totalOldValue + totalNewValue) / totalAmount
          existingAsset.amount = totalAmount
          existingAsset.currentPrice = asset.currentPrice
          existingAsset.lastUpdate = asset.lastUpdate
        } else {
          this.assets.push(asset)
        }
        this.saveToStorage()
      } catch (error) {
        this.error = 'Varlık eklenirken hata oluştu'
        console.error('Varlık ekleme hatası:', error)
      }
    },

    removeAsset(symbol: string) {
      try {
        const index = this.assets.findIndex(a => a.symbol === symbol)
        if (index !== -1) {
          this.assets.splice(index, 1)
          this.saveToStorage()
        }
      } catch (error) {
        this.error = 'Varlık silinirken hata oluştu'
        console.error('Varlık silme hatası:', error)
      }
    },

    updatePrice(symbol: string, currentPrice: number) {
      try {
        const asset = this.assets.find(a => a.symbol === symbol)
        if (asset) {
          asset.currentPrice = currentPrice
          asset.lastUpdate = Date.now()
          this.saveToStorage()
        }
      } catch (error) {
        this.error = 'Fiyat güncellenirken hata oluştu'
        console.error('Fiyat güncelleme hatası:', error)
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    totalInvestment(): number {
      return this.assets.reduce((total, asset) => total + (asset.purchasePrice * asset.amount), 0)
    },

    currentValue(): number {
      return this.assets.reduce((total, asset) => total + (asset.currentPrice * asset.amount), 0)
    },

    profitLoss(): number {
      const investment = this.totalInvestment
      return investment > 0 ? ((this.currentValue - investment) / investment) * 100 : 0
    },

    hasAssets(): boolean {
      return this.assets.length > 0
    }
  }
}) 
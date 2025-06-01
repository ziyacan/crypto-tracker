export interface Asset {
  symbol: string          // Forex pair (örn: EUR/USD)
  purchasePrice: number   // Alış fiyatı
  currentPrice: number    // Güncel fiyat
  amount: number         // Miktar (volume)
  lastUpdate: number     // Son güncelleme timestamp'i
}

export interface AssetTransaction {
  symbol: string
  price: number
  amount: number
  timestamp: number
  type: 'buy' | 'sell'
}

export interface CryptoPair {
  symbol: string
  price: number
  priceChange: number
  volume: number
  lastUpdate: number
}

export interface BuyVolume {
  [key: string]: number
} 
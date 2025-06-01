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

export interface WebSocketMessage {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  p: string // Price change
  P: string // Price change percent
  v: string // Volume
  q: string // Quote volume
  c: string // Current price
} 
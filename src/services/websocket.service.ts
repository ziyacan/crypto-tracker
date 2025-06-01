import { ref } from 'vue'
import type { WebSocketMessage, CryptoPair } from '../types'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 3000
  private symbols: string[] = []
  private _isConnected = ref(false)

  constructor() {
    this.symbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
      'XRPUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT', 'BCHUSDT',
      'UNIUSDT', 'SOLUSDT', 'MATICUSDT', 'AVAXUSDT', 'ATOMUSDT',
      'VETUSDT', 'TRXUSDT', 'EOSUSDT', 'AAVEUSDT', 'XLMUSDT'
    ]
  }

  public get isConnected() {
    return this._isConnected.value
  }

  public connect(onMessage: (data: CryptoPair[]) => void): void {
    try {
      const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
      this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

      this.ws.onopen = () => {
        console.log('WebSocket bağlantısı başarılı')
        this.reconnectAttempts = 0
        this._isConnected.value = true
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const data = message.data as WebSocketMessage

          const cryptoPair: CryptoPair = {
            symbol: data.s,
            price: parseFloat(data.c),
            priceChange: parseFloat(data.P),
            volume: parseFloat(data.v),
            lastUpdate: data.E
          }

          onMessage([cryptoPair])
        } catch (error) {
          console.error('WebSocket veri işleme hatası:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket hatası:', error)
        this._isConnected.value = false
        this.reconnect(onMessage)
      }

      this.ws.onclose = () => {
        console.log('WebSocket bağlantısı kapandı')
        this._isConnected.value = false
        this.reconnect(onMessage)
      }
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error)
      this._isConnected.value = false
      this.reconnect(onMessage)
    }
  }

  private reconnect(onMessage: (data: CryptoPair[]) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect(onMessage)
      }, this.reconnectDelay)
    } else {
      console.error('Maksimum yeniden bağlanma denemesi aşıldı')
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this._isConnected.value = false
    }
  }
}

export const webSocketService = new WebSocketService() 
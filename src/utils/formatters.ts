export const formatPrice = (price: number): string => {
  if (price >= 1000) return price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
  if (price >= 1) return price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })
  return price.toLocaleString('tr-TR', { maximumFractionDigits: 8 })
}

export const formatChange = (change: number): string => {
  return (change > 0 ? '+' : '') + change.toFixed(3) + '%'
}

export const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

export const formatSymbol = (symbol: string): string => {
  return symbol.replace('USDT', '')
} 
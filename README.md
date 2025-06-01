# Forex Takip Uygulaması

## Kurulum Adımları
1. Projeyi klonlayın:
```bash
git clone https://github.com/ziyacan/crypto-tracker.git
cd crypto-tracker
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm run dev
```

## Kullanılan Teknolojiler
- **Vue 3 Composition API**: Modern, reaktif ve performanslı kullanıcı arayüzü geliştirmek için
- **TypeScript**: Tip güvenliği ve daha iyi kod organizasyonu için
- **Tailwind CSS**: Hızlı ve özelleştirilebilir stil geliştirme için
- **Vite**: Hızlı geliştirme deneyimi ve optimum build performansı için
- **WebSocket**: Gerçek zamanlı forex verisi için
- **ESLint & Prettier**: Kod kalitesi ve formatı için
- **PostCSS**: CSS işleme ve optimizasyon için

## Proje Yapısı
```
crypto-tracker/
├── src/
│   ├── assets/          # Statik dosyalar
│   ├── components/      # Yeniden kullanılabilir bileşenler
│   ├── views/          # Sayfa bileşenleri
│   ├── stores/         # Store dosyaları
│   ├── services/       # API ve WebSocket servisleri
│   ├── types/          # TypeScript tip tanımlamaları
│   ├── utils/          # Yardımcı fonksiyonlar
│   ├── App.vue         # Ana uygulama bileşeni
│   ├── main.ts         # Uygulama giriş noktası
│   ├── style.css       # Global stiller
│   └── types.ts        # Global tip tanımlamaları
├── public/             # Statik public dosyalar
├── vite.config.ts      # Vite yapılandırması
├── tailwind.config.js  # Tailwind CSS yapılandırması
├── postcss.config.js   # PostCSS yapılandırması
├── tsconfig.json       # TypeScript yapılandırması
└── package.json        # Proje bağımlılıkları
```

## Önemli Kararlar ve Sebepleri

### 1. Vue 3 Composition API Kullanımı
- Daha iyi kod organizasyonu ve yeniden kullanılabilirlik
- TypeScript ile daha iyi entegrasyon
- Performans optimizasyonları için daha fazla kontrol

### 2. Tailwind CSS Tercihi
- Hızlı geliştirme imkanı
- Özelleştirilebilir ve ölçeklenebilir tasarım sistemi
- Utility-first yaklaşımı ile daha az CSS kodu
- Responsive tasarım için kolay kullanım

### 3. WebSocket Yönetimi
- Singleton pattern kullanılarak tek bir WebSocket bağlantısı
- Reconnection mantığı ile bağlantı kopması durumunda otomatik yeniden bağlanma
- Event-based mimari ile veri akışı yönetimi

### 4. TypeScript Kullanımı
- Tip güvenliği ile hataların erken tespiti
- Daha iyi kod tamamlama ve IDE desteği
- Kodun bakımını ve refactor işlemlerini kolaylaştırma

### 5. Vite Build Tool
- Hızlı geliştirme sunucusu
- Modern ES modülleri ile daha iyi performans
- Optimum production build çıktısı

## Demo
[Canlı Demo] : (https://crypto-tracker-ten-inky.vercel.app/tracker)

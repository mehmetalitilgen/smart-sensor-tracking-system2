# Smart Sensor Tracking System

Akıllı Sensör Takip Sistemi, sensör verilerini gerçek zamanlı olarak izlemek, analiz etmek ve raporlamak için geliştirilmiş bir API servisidir.

## Özellikler

- 🔐 JWT tabanlı kimlik doğrulama
- 👥 Rol tabanlı yetkilendirme (ADMIN, USER)
- 📊 Gerçek zamanlı sensör verisi görüntüleme
- 📈 Grafik ve istatistik raporları
- 🔄 WebSocket ile canlı veri akışı
- 🔍 Detaylı log analizi
- 🏢 Şirket yönetimi
- 👤 Kullanıcı yönetimi
- 🛡️ Rate limiting koruması

## Teknoloji Yığını

- NestJS (TypeScript)
- PostgreSQL (Prisma ORM)
- InfluxDB (Zaman serisi veritabanı)
- MQTT (Gerçek zamanlı veri iletişimi)
- JWT (Kimlik doğrulama)
- WebSocket (Canlı veri akışı)
- Docker & Docker Compose
- GitHub Actions (CI/CD)

## Kurulum

### Gereksinimler
- Node.js (v20 veya üzeri)
- Docker ve Docker Compose
- Yarn veya npm
- Git

### Geliştirme Ortamı Kurulumu

1. Projeyi klonlayın:
```bash
git clone https://github.com/mehmetalitilgen/smart-sensor-tracking-system2.git
cd smart-sensor-tracking-system2
```

2. Bağımlılıkları yükleyin:
```bash
# npm ile
npm install

# veya yarn ile
yarn install
```

3. Docker konteynerlerini başlatın:
```bash
docker-compose up -d
```

4. Veritabanı migrasyonlarını çalıştırın:
```bash
# PostgreSQL migration
npx prisma migrate dev

# InfluxDB bucket oluşturma
influx bucket create -n sensor_data -o your-org -r 0
```
4. ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

6. Geliştirme sunucusunu başlatın:
```bash
# npm ile
npm run start:dev

# veya yarn ile
yarn start:dev
```

### Production Ortamı Kurulumu

1. Production ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

2. Docker image'ı oluşturun:
```bash
docker build -t smart-sensor-api .
```

3. Servisleri başlatın:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Ortam Değişkenleri

### .env
```env
# Database
DATABASE_URL="postgresql://postgres:123@localhost:5436/nest"

# JWT
JWT_SECRET="your-super-secure-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"

# MQTT
MQTT_URL="mqtt://localhost:8883"
MQTT_USERNAME="admin"
MQTT_PASSWORD="admin123"

# InfluxDB
INFLUXDB_URL="http://localhost:8086"
INFLUXDB_TOKEN="admin123"
INFLUXDB_ORG="nestjs-org"
INFLUXDB_BUCKET="sensordata"

# API Key (Opsiyonel)
API_KEY="your-api-key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SENSOR_WINDOW_MS=60000
RATE_LIMIT_SENSOR_MAX_REQUESTS=50

# Docker Hub
DOCKERHUB_USERNAME="your-dockerhub-username"
```

## Kullanılabilir Komutlar

```bash
# Geliştirme modunda başlatma
npm run start:dev
yarn start:dev

# Production build
npm run build
yarn build

# Production modunda başlatma
npm run start:prod
yarn start:prod

# Test çalıştırma
npm run test
yarn test

# E2E test çalıştırma
npm run test:e2e
yarn test:e2e

# Prisma migrasyonları
npm run prisma:migrate
yarn prisma:migrate

# Prisma studio
npm run prisma:studio
yarn prisma:studio
```

## Docker Komutları

```bash
# Geliştirme ortamı
docker-compose up -d
docker-compose down
docker-compose logs -f

# Production ortamı
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f

# Volume yönetimi
docker volume ls
docker volume prune

# Container yönetimi
docker ps
docker logs -f [container-name]
docker restart [container-name]
```

## CI/CD

Proje GitHub Actions ile CI/CD pipeline'ı kullanmaktadır:

### CI Pipeline
- Her push ve pull request'te çalışır
- Unit testleri çalıştırır
- E2E testleri çalıştırır
- Code coverage raporu oluşturur

### CD Pipeline
- main branch'e push yapıldığında çalışır
- Docker image'ı oluşturur
- Docker Hub'a push yapar
- Production sunucusuna deploy eder

## API Dokümantasyonu

API endpoint'leri ve kullanımları için Postman collection'ı `Smart_Sensor_API.postman_collection.json` dosyasında bulunmaktadır.

### Önemli Endpoint'ler

- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /sensor-data` - Sensör verilerini getir
- `GET /sensor-data/device/:deviceId` - Cihaza göre sensör verilerini getir
- `GET /sensor-data/company/:companyId` - Şirkete göre sensör verilerini getir
- `GET /sensor-data/measurement/:measurementType` - Ölçüm tipine göre sensör verilerini getir
- `GET /sensor-data/stats` - Sensör verisi istatistiklerini getir

## Test

```bash
# Unit testler
npm run test
yarn test

# E2E testler
npm run test:e2e
yarn test:e2e

# Test coverage
npm run test:cov
yarn test:cov
```

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@mehmetalitilgen](https://github.com/mehmetalitilgen)

Proje Linki: [https://github.com/mehmetalitilgen/smart-sensor-tracking-system2](https://github.com/mehmetalitilgen/smart-sensor-tracking-system2)

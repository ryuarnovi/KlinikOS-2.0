# KlinikOS 2.0

> Enterprise Resource Planning System untuk Klinik

## 🏗️ Arsitektur

| Komponen | Teknologi | Port |
|---|---|---|
| **Frontend** | Next.js + TypeScript + Tailwind CSS | 3000 |
| **Backend** | Go + Gin Framework | 9090 |
| **Database** | PostgreSQL | 5432 |

## 🚀 Cara Menjalankan

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone Repositori
```bash
git clone https://github.com/ryuarnovi/KlinikOS-2.0.git
cd KlinikOS-2.0
```

### 2. Konfigurasi Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env dengan konfigurasi Anda
```

### 3. Jalankan dengan Docker
```bash
docker compose up --build
```

Akses aplikasi di: **http://localhost:3000**

## 🔧 Environment Variables (backend/.env)
```
PORT=9090
DB_DSN=postgres://user:password@localhost:5432/klinikos?sslmode=disable
JWT_SECRET=your_secret_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_ENV=sandbox
```

## 📋 Fitur
- ✅ Manajemen Pasien (CRUD)
- ✅ Rekam Medis SOAP
- ✅ Resep Obat & Farmasi
- ✅ Sistem Antrean
- ✅ Rujukan Pasien
- ✅ Billing & Invoice (Cash, QRIS, Transfer Bank, Midtrans)
- ✅ Manajemen Stok Obat
- ✅ Role-based Access Control (Admin, Dokter, Perawat, Apoteker, Kasir, Resepsionis)

## 📁 Struktur Folder
```
KlinikOS-2.0/
├── backend/          # Go API Server
│   ├── cmd/          # Entry point
│   ├── internal/     # Handlers, Models, Middleware
│   └── migrations/   # SQL migrations
├── frontend/         # Next.js App
│   └── app/          
│       └── src/      # Pages, Components, Services
├── schema.sql        # Database schema
└── docker-compose.yml
```

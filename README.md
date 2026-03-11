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

## 📋 Fitur Utama
- ✅ **Manajemen Pasien Terpadu**: CRUD data pasien dan rekam medis (SOAP).
- ✅ **Sistem Antrean & Rujukan**: Terintegrasi langsung dengan antrean dan pembuatan resep (alur _Referral to Queue/Prescription_ dengan _status tracking_ otomatis).
- ✅ **Farmasi & Inventory**: Manajemen stok obat dan resep terpusat dengan peringatan stok menipis.
- ✅ **Billing & Pembayaran Omnichannel**: 
  - Tunai (Cash)
  - Bank Transfer (Verifikasi manual)
  - QRIS (QR Code dinamis terintegrasi `api.qrserver.com`)
  - Midtrans (GoPay, Virtual Account, Kartu Kredit)
  - Crypto Payment (Integrasi dompet Web3 MetaMask untuk Ethereum, dan simulasi Solana Phantom wallet).
- ✅ **Role-Based Access Control**: Manajemen hak akses tingkat lanjut (Admin, Dokter, Perawat, Apoteker, Kasir, Resepsionis).
- ✅ **Dashboard Eksekutif**: Ringkasan jumlah kunjungan, status persediaan, resep tertunda, dan tren pendapatan bulanan/mingguan.

## 📁 Struktur Folder
```
KlinikOS-2.0/
├── backend/          # Go API Server
│   ├── cmd/          # Entry point
│   ├── internal/     # Handlers, Models, Middleware
│   └── migrations/   # SQL migrations
|   |__ tmp/
├── frontend/         # Next.js App
│   └── app/          
│       └── src/      # Pages, Components, Services
├── schema.sql        # Database schema
└── docker-compose.yml
```

## 🗺️ Roadmap & Pengembangan Mendatang

Berikut adalah daftar fitur yang direncanakan untuk dikembangkan guna meningkatkan kelengkapan sistem KlinikOS:

- [ ] **Integrasi BPJS (P-Care / vClaim)**: Sinkronisasi data pasien dan klaim langsung ke sistem BPJS Kesehatan.
- [ ] **Inventaris & Logistik Farmasi (Advanced)**: 
    - [ ] **Batch & Expiry Tracking**: Melacak nomor batch dan peringatan otomatis obat kadaluarsa.
    - [ ] **Stock Opname**: Verifikasi stok fisik vs sistem secara berkala.
    - [ ] **Procurement (PO)**: Manajemen pemesanan obat ke supplier (PBF).
- [ ] **Modul Laboratorium & Radiologi (LIS/RIS)**: 
    - [ ] **Order Lab**: Pengiriman order tes dari rekam medis.
    - [ ] **Upload Hasil**: Penyimpanan file hasil lab atau gambar radiologi (DICOM).
- [ ] **Manajemen Jadwal Dokter & Shift Staff (HRIS)**: Pengaturan jadwal praktek harian yang terhubung ke sistem antrean.
- [ ] **Rekam Medis Elektronik (EMR) Terstandardisasi**: Integrasi kode diagnosis **ICD-10** dan kode tindakan **ICD-9 CM**.
- [ ] **Portal Pasien & Mobile App**: 
    - [ ] **Booking Online**: Pengambilan nomor antrean via web/mobile.
    - [ ] **Riwayat Medis Mandiri**: Akses pasien ke hasil lab atau resep mereka sendiri.
- [ ] **Dashboard Eksekutif & Business Intelligence (BI)**: Analisis tren penyakit, pendapatan harian/bulanan, dan efisiensi layanan (TAT).
- [ ] **Telemedicine**: Integrasi konsultasi jarak jauh via video call dan resep elektronik (Digital Prescription).

---

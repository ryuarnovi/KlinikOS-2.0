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
- ✅ **Workflows Spesialis Sesuai Role (RBAC Premium)**:
  - **Resepsionis**: Manajemen pendaftaran, plotting antrean pasien, dan pengelolaan rujukan periksa.
  - **Dokter**: Panel pemeriksaan medis terpadu (SOAP) dengan daftar tunggu pasien personal dan fitur "Panggil Pasien" sekali klik.
  - **Staf Medis (Perawat)**: Pemantauan antrean dan pendampingan rekam medis.
  - **Apoteker**: Manajemen antrean penebusan obat dan inventaris farmasi secara real-time.
  - **Kasir**: Antrean pembayaran omnichannel dengan pelacakan invoice tertunda.
- ✅ **Rekam Medis Elektronik (EMR) Terstandardisasi**: Integrasi penuh kode diagnosis **ICD-10** dan kode tindakan **ICD-9 CM** pada form SOAP.
- ✅ **Manajemen Jadwal Dokter & Shift Staff (HRIS)**: Pengaturan jadwal praktek harian dengan visibilitas personal (Staf hanya melihat jadwal/shift mereka sendiri).
- ✅ **Sistem Antrean & Rujukan**: Alur otomatis dari Pendaftaran ➡️ Pemeriksaan ➡️ Resep/Rujukan ➡️ Billing.
- ✅ **Farmasi & Inventory**: Pelacakan stok obat otomatis dengan ambang batas (low stock) yang terintegrasi dengan push notification.
- ✅ **Billing & Pembayaran Omnichannel**: 
  - Tunai (Cash), Bank Transfer, QR Code Dinamis, Midtrans Integration, dan Web3 Crypto (ETH/SOL).
- ✅ **Dashboard Eksekutif**: Visualisasi data real-time untuk kunjungan, pendapatan, dan efisiensi layanan.

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
- [x] **Manajemen Jadwal Dokter & Shift Staff (HRIS)**: Implementasi awal jadwal praktek dan shift harian.
- [x] **Rekam Medis Elektronik (EMR) Terstandardisasi**: Integrasi ICD-10 & ICD-9 CM telah diimplementasikan.
- [ ] **Portal Pasien & Mobile App**: 
    - [ ] **Booking Online**: Pengambilan nomor antrean via web/mobile.
    - [ ] **Riwayat Medis Mandiri**: Akses pasien ke hasil lab atau resep mereka sendiri.
- [ ] **Telemedicine**: Integrasi konsultasi jarak jauh via video call dan resep elektronik.
- [ ] **Business Intelligence (BI) Dashboard**: Analisis TAT (Turn Around Time) dan tren pendapatan.

---

# 🏥 Klinikos Project Specification & Roadmap

## 1. Ringkasan Eksekutif
**Klinikos** adalah sistem Manajemen Klinik (KlinikOS) modern yang dirancang untuk mendukung operasional klinik secara *end-to-end*. Sistem ini mengintegrasikan alur pasien mulai dari pendaftaran (resepsionis), pemeriksaan medis (dokter/perawat), pengelolaan obat (farmasi), hingga penyelesaian transaksi (kasir/pembayaran).

Klinikos membedakan dirinya dengan antarmuka yang estetis (Industrial Sci-Fi) dan dukungan pembayaran multi-channel, termasuk integrasi mata uang kripto (Blockchain).

---

## 2. Spesifikasi Teknis (Existing)

### 🏗️ Arsitektur Sistem
- **Frontend**: Next.js (React), Tailwind CSS, Lucide React (sedang migrasi ke Flaticon).
- **Backend**: Go (Gin Gonic framework).
- **Database**: PostgreSQL dengan sistem migrasi SQL terstruktur.
- **Containerization**: Docker & Docker Compose untuk orkestrasi layanan.
- **Authentication**: Stateful JWT-based authentication dengan Role-Based Access Control (RBAC).

### 🔑 Modul Utama & Tabel Database
1.  **User & Access Control**: Manajemen staf dengan role khusus (Admin, Resepsionis, Dokter, Perawat, Apoteker, Kasir).
2.  **Manajemen Pasien**: Data demografis dan riwayat kunjungan.
3.  **Antrean (Queue)**: Sistem antrean yang menghubungkan resepsionis ke dokter.
4.  **Rekam Medis (EMR)**: Pencatatan SOAP (Subjective, Objective, Assessment, Plan).
5.  **Farmasi & Inventaris**:
    - Pengelolaan stok obat.
    - Pembuatan resep otomatis dari input dokter.
    - Tracking transaksi stok dan supplier.
6.  **Billing & Pembayaran**:
    - **Metode**: Cash, QRIS (Manual/Integrasi), Bank Transfer.
    - **Web3 Integration**: Pembayaran via MetaMask (ETH) dan Phantom (Solana).

---

## 3. Rencana Perkembangan Fitur (Unbuilt/Next Phase)

Pengembangan Klinikos ke depan akan difokuskan pada tiga pilar utama: **Efisiensi Kerja**, **Integrasi Ekosistem**, dan **Pengalaman Pasien**.

### 🤖 Pilar 1: AI & Otomasi (Intelligent Clinic)
- **AI SOAP Assistant (Scribe)**: Fitur *Voice-to-Text* yang dapat menyusun draf catatan SOAP secara otomatis dari percakapan dokter-pasien.
- **Predictive Inventory**: Analisis AI untuk memprediksi kapan stok obat tertentu akan habis berdasarkan tren mingguan/bulanan.
- **AI Diagnosis Suggestion**: Memberikan saran kode **ICD-10** kepada dokter berdasarkan gejala (Assessment) yang diinput.

### 🌐 Pilar 2: Integrasi Nasional & Ekosistem
- **Integrasi SATUSEHAT (HL7 FHIR)**: Kepatuhan terhadap standar Kemenkes RI untuk sinkronisasi rekam medis nasional.
- **Integrasi BPJS (P-Care)**: Memungkinkan klinik melayani pasien BPJS dengan sinkronisasi klaim langsung. (🚀 *Schema Ready*)
- **Modul Laboratorium & Radiologi**: Fitur pengiriman order tes ke lab rekanan dan penerimaan hasil digital dalam format PDF/DICOM. (🚀 *Schema Ready*)

### 📱 Pilar 3: Portal Pasien & Mobile App
- **Self-Check-in & Booking**: Pasien dapat mengambil nomor antrean dari rumah via aplikasi web/mobile.
- **E-Receipt & Medical History**: Pasien memiliki dasbor pribadi untuk melihat riwayat kesehatan, hasil lab, dan nota pembayaran secara digital.
- **Telemedicine**: Integrasi video call untuk konsultasi jarak jauh dan pengiriman obat via kurir (Logistik Farmasi).

---

## 4. Standar Desain & Estetika (Core Identity)
Klinikos mengusung tema **Arknights: Endfield** yang dicirikan dengan:
- **Warna**: Palet monokromatik dengan aksen warna fungsional (Orange/Cyan).
- **Elemen UI**: Glassmorphism, garis-garis tipis industrial, dan tipografi sans-serif modern (Inter/Outfit).
- **Interaksi**: Animasi mikro pada transisi state dan pemuatan data yang halus.

---

## 5. Daftar Prioritas Pengembangan Segera
- [x] **Sistem Batch & Expiry**: Menambahkan kolom `batch_number` dan `expiry_date` pada tabel obat untuk kontrol kualitas. (✅ *Backend Ready*)
- [ ] **Laporan Keuangan Mendalam**: Dashboard pendapatan yang memisahkan profit dari obat dan jasa tindakan.
- [ ] **Notifikasi Real-time**: Menggunakan WebSocket untuk memberitahukan farmasi jika ada resep baru masuk dari dokter.
- [x] **Modul Human Resource (HRIS)**: Pengaturan shift kerja perawat dan dokter. (✅ *Backend Ready*)
- [x] **Standardisasi EMR (ICD-10/9)**: Integrasi diagnosis dan tindakan standar internasional. (✅ *Backend Ready*)

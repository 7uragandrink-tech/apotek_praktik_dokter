# 📋 PANDUAN INSTALASI — Aplikasi Apotek & Praktik Mandiri Dokter Spesialis Kulit dan Kelamin

**Versi migrasi:** 1.2-api · **Arsitektur:** Frontend di **GitHub Pages** + Backend **Google Apps Script (REST API)** + Database **Google Sheets**

Panduan ini ditulis untuk pengguna yang **belum pernah memakai Git/GitHub**. Ikuti urutannya dari atas ke bawah. Setiap langkah punya "tanda berhasil" — jangan lanjut sebelum tandanya terlihat.

---

## Daftar isi

1. [Gambaran besar](#1-gambaran-besar)
2. [Isi paket & kegunaannya](#2-isi-paket--kegunaannya)
3. [Persiapan](#3-persiapan)
4. [BAGIAN A — Pasang backend (Google Apps Script)](#4-bagian-a--pasang-backend-google-apps-script)
5. [BAGIAN B — Pasang frontend (GitHub Pages)](#5-bagian-b--pasang-frontend-github-pages)
6. [BAGIAN C — Uji akhir](#6-bagian-c--uji-akhir)
7. [BAGIAN D — Setelah berhasil](#7-bagian-d--setelah-berhasil)
8. [Cara memperbarui di kemudian hari](#8-cara-memperbarui-di-kemudian-hari)
9. [Apa yang berubah dan tidak berubah](#9-apa-yang-berubah-dan-tidak-berubah)
10. [Troubleshooting](#10-troubleshooting)
11. [Glosarium](#11-glosarium)
12. [Lampiran: kontrak API](#12-lampiran-kontrak-api)

---

## 1. Gambaran besar

**Sebelum migrasi:** seluruh aplikasi (tampilan + logika) berjalan di dalam Google Apps Script. Alamat aplikasi panjang (`script.google.com/macros/s/.../exec`) dan tampil di dalam bingkai Google.

**Sesudah migrasi:** dipisah menjadi dua bagian.

```
┌──────────────────────────────────────────────┐
│  FRONTEND — GitHub Pages                     │
│  https://USERNAME.github.io/NAMA-REPO/       │
│  index.html + css/ + js/                     │
│  (yang dilihat & diklik pengguna)            │
└───────────────┬──────────────────────────────┘
                │ fetch() — kirim & terima JSON
┌───────────────▼──────────────────────────────┐
│  BACKEND — Google Apps Script (Kode.gs)      │
│  Hanya REST API: cek login, cek hak akses,   │
│  baca/tulis data. Tidak menampilkan halaman. │
└───────────────┬──────────────────────────────┘
                │
┌───────────────▼──────────────────────────────┐
│  DATABASE — Google Sheets                    │
│  (pasien, antrian, resep, stok, kas, dst.)   │
└──────────────────────────────────────────────┘
```

**Yang tidak berubah:** semua fitur, peran (Pemilik, Pendaftaran, Dokter, Apotek dan Kasir), hak akses, skema data, dan data lama Anda.

**Keamanan tetap di server:** meskipun tampilan kini berada di GitHub, **login, pengecekan peran, dan semua aturan bisnis tetap dijalankan oleh Apps Script**. Repository GitHub hanya berisi tampilan — tidak ada data pasien, kata sandi, maupun token WhatsApp.

---

## 2. Isi paket & kegunaannya

Anda menerima **3 jenis berkas** yang diserahkan terpisah (sesuai cara pemakaiannya):

| Berkas | Dipakai di mana | Cara memakai |
|---|---|---|
| `Kode.gs` | Google Apps Script | **Salin-tempel** isinya ke editor Apps Script |
| `appsscript.json` | Google Apps Script | **Salin-tempel** isinya ke file manifest |
| `apotek-praktik-dokter.zip` | GitHub Pages | **Ekstrak**, lalu push ke GitHub |
| `PANDUAN-INSTALASI.md` | Dibaca | Dokumen ini (ada juga salinannya di dalam ZIP) |

Isi ZIP setelah diekstrak:

```
apotek-praktik-dokter/
├── index.html            ← halaman utama (HARUS berada di root)
├── README.md
├── PANDUAN-INSTALASI.md
├── .nojekyll
├── css/
│   └── style.css
├── js/
│   ├── config.js         ← ★ satu-satunya file yang Anda edit
│   ├── api.js
│   └── app.js
└── img/
    └── logo.png
```

> ⚠️ **File backend (`Kode.gs`, `appsscript.json`) sengaja TIDAK ada di dalam ZIP** dan tidak boleh ikut di-push ke GitHub.

---

## 3. Persiapan

Yang Anda butuhkan:

- ✅ Akun **Google** yang memiliki Spreadsheet database aplikasi (atau akun baru bila instalasi baru)
- ✅ Akun **GitHub** — daftar gratis di <https://github.com> (**username** Anda akan menjadi bagian alamat situs: `username.github.io`, pilihlah dengan sadar)
- ✅ Komputer Windows / Mac / Linux dengan koneksi internet
- ✅ **Git** terpasang (dipasang di Bagian B, Langkah B1)

> 🛡️ **WAJIB sebelum mulai — buat cadangan data.**
> Buka Google Sheets database Anda → menu **File → Make a copy** (*Buat salinan*). Simpan salinan itu. Bila terjadi kesalahan, data Anda aman.

---

## 4. BAGIAN A — Pasang backend (Google Apps Script)

### Pilih jalur Anda

| Situasi Anda | Pilih | Keuntungan |
|---|---|---|
| **Sudah memakai aplikasi ini** (ada data pasien, stok, dll.) | **Jalur 1** — pakai proyek Apps Script yang sama | Data, pengaturan WhatsApp, akun pengguna, dan jadwal backup harian **tetap utuh** |
| **Instalasi baru / kosong** | **Jalur 2** — proyek baru | Folder Drive & database dibuat otomatis |

> 💡 Anda yang sudah punya data: **pilih Jalur 1**. URL aplikasi lama tetap berjalan sebagai cadangan sampai Anda memutuskan menghapusnya, jadi bila ada masalah Anda bisa kembali.

---

### JALUR 1 — Pakai proyek yang sudah ada

**A1-1. Buka editor Apps Script**
Buka Google Sheets database Anda → menu **Extensions (Ekstensi) → Apps Script**.

**A1-2. Tampilkan file manifest**
Di kiri klik ikon **⚙ Project Settings (Setelan proyek)** → centang **"Show 'appsscript.json' manifest file in editor"**. Kembali ke **Editor** (ikon `< >`).
✔️ *Tanda berhasil:* di daftar file kiri muncul `appsscript.json`.

**A1-3. Ganti isi `Kode.gs`**
Klik file **Kode** (atau *Code*) → tekan **Ctrl+A** (pilih semua) → **Delete** → buka berkas `Kode.gs` dari paket ini, **Ctrl+A → Ctrl+C**, lalu **Ctrl+V** di editor → klik ikon 💾 **Save**.

**A1-4. Ganti isi `appsscript.json`**
Klik file `appsscript.json` → pilih semua → hapus → tempel isi berkas `appsscript.json` dari paket → **Save**.

> Berkas HTML lama (`Index`, `JavaScript`, `Stylesheet`) **biarkan dulu**. Tidak mengganggu, dan berguna sebagai cadangan. Anda akan menghapusnya di Bagian D setelah semuanya berhasil.

**A1-5. Jalankan setup (aman diulang di jalur ini)**
Di bagian atas editor, pada daftar fungsi pilih **`setupAppEnvironment`** → klik **▶ Run**.
- Muncul **"Authorization required" → Review permissions** → pilih akun Google Anda → bila ada peringatan *"Google hasn't verified this app"* klik **Advanced → Go to … (unsafe) → Allow**. Ini normal untuk skrip milik sendiri.
- Buka **Execution log** (di bawah).

✔️ *Tanda berhasil:* log menampilkan `✅ Setup selesai. Spreadsheet: https://docs.google.com/...` dan di Spreadsheet muncul sheet baru bernama **AppConfig**.
Setup di jalur ini **tidak membuat database baru dan tidak menghapus data**; ia hanya memastikan semua sheet & kolom lengkap serta mencatat ID.

Lanjut ke **[Langkah A-7 (Deploy)](#a-7-deploy-sebagai-web-app)**.

---

### JALUR 2 — Instalasi baru

**A2-1.** Buka <https://script.google.com> → **New project (Proyek baru)** → ubah nama menjadi `Klinik API`.
**A2-2.** Di **Project Settings (⚙)** centang **"Show 'appsscript.json' manifest file in editor"**.
**A2-3.** Ganti nama `Code.gs` menjadi `Kode` (klik ⋮ → Rename) → tempel seluruh isi berkas `Kode.gs` → Save.
**A2-4.** Buka `appsscript.json` → tempel isi berkas `appsscript.json` dari paket → Save.
**A2-5.** Pilih fungsi **`setupAppEnvironment`** → **▶ Run** — **HANYA SEKALI** → izinkan akses seperti pada A1-5.
**A2-6.** Buka **Execution log** dan **catat dengan teliti** (hanya tampil sekali):

```
🔑 LOGIN AWAL → username: admin | password: xxxxxxxx   ← segera diganti setelah login
🛟 KODE PEMULIHAN (simpan): XXXX-XXXX-XXXX             ← simpan di tempat aman
```
✔️ *Tanda berhasil:* di **Google Drive** ada folder **📁 Praktek Mandiri Dokter Spesialis** berisi file **🗃️ Database — …** (dengan sheet-sheet aplikasi dan **AppConfig**) serta sub-folder 📂 Uploads dan 📂 Exports.

> **Instalasi baru tetapi ingin memakai database lama?** Sebelum A2-5, buka **⚙ Project Settings → Script properties → Add script property**: nama `SPREADSHEET_ID`, nilai = ID spreadsheet lama (potongan panjang di URL Sheets antara `/d/` dan `/edit`). Lalu jalankan setup. Perhatikan: di proyek baru Anda perlu mengisi ulang **token WhatsApp** (Pengaturan), mengaktifkan ulang **backup harian**, dan password yang bisa dilihat Pemilik tidak terbawa. Karena itu Jalur 1 lebih disarankan bila data sudah ada.

---

### A-7. Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Klik ikon ⚙ di samping "Select type" → pilih **Web app**.
3. Isi:

| Kolom | Isi |
|---|---|
| Description | `REST API v1.2` |
| **Execute as** | **Me** (akun Anda) |
| **Who has access** | **Anyone** (Siapa saja) |

4. Klik **Deploy** (izinkan bila diminta).
5. **Salin "Web app URL"** — berakhiran **`/exec`**. Tempel di Notepad dulu, Anda akan memerlukannya di Bagian B.

> ⚠️ Kedua pengaturan di atas **wajib persis begitu**. Bila "Who has access" bukan **Anyone**, aplikasi di GitHub tidak akan bisa terhubung. Keamanan data tetap terjaga karena setiap permintaan data diperiksa login & perannya oleh server.

### A-8. Tes backend

Tempel URL `/exec` tadi di kolom alamat browser (jendela **Incognito** lebih baik) lalu Enter.

✔️ *Tanda berhasil:* tampil teks seperti ini (bukan halaman login Google):

```json
{"success":true,"data":{"app":"Praktek Mandiri Dokter Spesialis","versi":"1.2-api","waktu":"2026-11-10 09:30","siap":true}}
```

Bila tampil halaman login Google atau "Sorry, unable to open the file" → lihat [Troubleshooting](#10-troubleshooting).

---

## 5. BAGIAN B — Pasang frontend (GitHub Pages)

> 🛑 **Aturan emas Bagian B:** semua dikerjakan **lewat terminal**. **Jangan** memakai tombol *"Add file → Upload files"* di situs GitHub — cara itu meratakan semua file ke satu folder sehingga CSS/JS 404 dan situs tampil rusak.

### B1. Pasang Git

- **Windows:** unduh dari <https://git-scm.com/download/win>, jalankan installer dengan **pengaturan default** (klik Next terus). Lalu buka **PowerShell** dari Start Menu.
- **Mac:** buka *Terminal*, ketik `git --version`; bila belum ada, macOS menawarkan pemasangan otomatis.
- **Linux:** `sudo apt install git`

Verifikasi:
```bash
git --version
```
✔️ *Tanda berhasil:* muncul sesuatu seperti `git version 2.4x.x`.

### B2. Identitas Git (sekali seumur komputer ini)

```bash
git config --global user.name "Nama Lengkap Anda"
git config --global user.email "email-akun-github-anda@contoh.com"
```
`user.name` bebas (hanya label riwayat; bukan username GitHub). `user.email` sebaiknya sama dengan email akun GitHub. Cek:
```bash
git config --global user.name
git config --global user.email
```

### B3. Buat repository di GitHub

Di <https://github.com> klik **+ (kanan atas) → New repository**, lalu:

| Kolom | Isi |
|---|---|
| Repository name | `apotek-praktik-dokter` (atau nama lain tanpa spasi) |
| Visibility | **Public** (wajib agar GitHub Pages gratis) |
| Add a README / .gitignore / license | **JANGAN dicentang apa pun** |

Klik **Create repository**. Biarkan halaman instruksinya terbuka.

> Aman dibuat Public: repository hanya berisi tampilan. Data pasien ada di Google Sheets Anda dan tidak pernah masuk ke GitHub.

### B4. Ekstrak ZIP dan isi alamat backend

1. **Ekstrak** `apotek-praktik-dokter.zip`:
   - **Windows:** klik kanan ZIP → **Extract All… → Extract**.
   - **Mac:** klik dua kali ZIP.
2. Hasilnya adalah folder bernama **`apotek-praktik-dokter`**. Di dalamnya **langsung** terlihat `index.html`, `css`, `js`, `img`. Misalnya lokasinya:
   ```
   C:\Users\NAMA-ANDA\Documents\apotek-praktik-dokter
   ```
   > ❗ **Inilah folder yang nanti di-`git init`** — bukan folder di atasnya, dan bukan folder `css` atau `js` di dalamnya. Bila setelah ekstrak Anda justru melihat satu folder lagi di dalam folder itu (`apotek-praktik-dokter\apotek-praktik-dokter\index.html`), foldernya yang **paling dalam** (yang berisi `index.html`) adalah folder kerja Anda.
3. **Edit `js\config.js`** (klik kanan → Open with → Notepad). Ganti tulisan `GANTI_DENGAN_URL_EXEC_ANDA` dengan URL `/exec` dari langkah A-7:

   ```js
   const GAS_URL = 'https://script.google.com/macros/s/AKfycb.....panjang.....xyz/exec';
   ```
   Pertahankan tanda kutip `' '` dan titik koma `;`. Simpan (Ctrl+S).

### B5. Masuk ke folder & verifikasi (GERBANG PALING PENTING)

Cara cepat di Windows: buka folder `apotek-praktik-dokter` di File Explorer → klik **kolom alamat** di atas → ketik `powershell` → **Enter**. PowerShell langsung terbuka **di folder itu**.

(Cara lain: `cd "C:\Users\NAMA-ANDA\Documents\apotek-praktik-dokter"`)

Lalu jalankan:
```powershell
dir
```
(di Git Bash / Mac / Linux: `ls -la`)

✔️ **Yang HARUS terlihat:** `index.html`, folder `css`, folder `js`, folder `img`.
❌ **Bila yang terlihat hanya folder** (mis. `apotek-praktik-dokter`) **dan tidak ada `index.html` → Anda satu level terlalu tinggi. Masuk dengan `cd apotek-praktik-dokter` lalu `dir` lagi. JANGAN lanjut ke `git init` sebelum `index.html` terlihat.** Git akan menerima folder yang salah tanpa protes sedikit pun, dan hasilnya situs 404.

Cek juga alamat backend sudah terisi:
```powershell
findstr GAS_URL js\config.js
```
✔️ Harus tampil `const GAS_URL = 'https://script.google.com/macros/s/....../exec';` — **bukan** `GANTI_DENGAN_URL_EXEC_ANDA`.

Pastikan **tidak ada file `.gs`** di folder ini (`Kode.gs` tidak boleh ikut).

### B6. Inisialisasi & push pertama

Jalankan **satu per satu**, perhatikan hasilnya:

**B6-a**
```bash
git init
```
→ `Initialized empty Git repository in ...`

**B6-b** — ada **titik** di akhir, artinya "semua file di folder ini":
```bash
git add .
```
→ tidak ada output (diam = berhasil)

**B6-c**
```bash
git commit -m "Upload pertama"
```
→ muncul daftar file (`create mode 100644 index.html`, dst.)

> 💡 **Apa maksud `"Upload pertama"`?** Itu hanya **catatan/label** untuk simpanan ini (commit), supaya nanti di riwayat GitHub Anda tahu isinya. Bukan perintah dan bukan pengaturan. Boleh diganti bebas (mis. `"Versi awal"`), asalkan tidak kosong dan tetap diapit tanda kutip. Pada pembaruan berikutnya, tulis catatan sesuai perubahan, mis. `"Ganti URL backend"`.

**B6-d**
```bash
git branch -M main
```

**B6-e** — ganti `USERNAME` dan `NAMA-REPO` dengan milik Anda:
```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
```

**B6-f**
```bash
git push -u origin main
```
Anda akan diminta masuk:
- Bila muncul **jendela login GitHub di browser** → pilih **Sign in with your browser** dan ikuti. Itu juga cara yang benar.
- Bila diminta **Username** dan **Password** di terminal: Username = username GitHub; **Password = Personal Access Token** (bukan password akun) → lihat B7.

> 💡 Saat mengetik/menempel token, **layar terlihat kosong** — tidak ada huruf atau bintang. Itu **normal**. Windows PowerShell: klik kanan untuk paste. Git Bash: Shift+Insert. Lalu Enter.

✔️ *Tanda berhasil:* muncul `Writing objects: 100%` dan `* [new branch]      main -> main`.

### B7. Membuat Personal Access Token (bila diminta)

Bila muncul `Password authentication is not supported` / `invalid credentials`:

1. Buka <https://github.com/settings/tokens>
2. **Generate new token → Generate new token (classic)**
3. Note: `git-push-token` · Expiration: `90 days` (atau No expiration) · **centang ✅ `repo`**
4. **Generate token** → **salin** (`ghp_...`) — hanya tampil sekali; simpan di Notepad
5. Ulangi `git push -u origin main` → tempel token sebagai password

Alternatif tanpa ketik token: **GitHub Desktop** (<https://desktop.github.com>) → login → *Add Local Repository* → pilih folder `apotek-praktik-dokter` → *Publish repository*.

### B8. Verifikasi repository di GitHub

Buka `https://github.com/USERNAME/NAMA-REPO` di browser. Harus terlihat:
- ✅ `index.html` **di baris teratas / root**
- ✅ folder `css/`, `js/`, `img/`
- ✅ tidak ada file `.gs`

Bila yang terlihat justru folder pembungkus tanpa `index.html` → lihat [Salah folder yang di-push](#salah-folder-yang-di-push-halaman-404).

### B9. Aktifkan GitHub Pages

Di repository: **Settings → Pages** (menu kiri):

| Kolom | Nilai |
|---|---|
| Source | **Deploy from a branch** |
| Branch | **main** · **/ (root)** |
| Enforce HTTPS | ✅ dicentang |

Klik **Save**. Tunggu 1–2 menit lalu muat ulang halaman Settings. Akan muncul:

> **Your site is live at `https://USERNAME.github.io/NAMA-REPO/`**

Itulah alamat aplikasi Anda. Simpan dan bagikan ke staf.

---

## 6. BAGIAN C — Uji akhir

Buka alamat aplikasi di browser. Tekan **Ctrl+Shift+R** (muat ulang paksa). Periksa:

| # | Uji | Hasil yang benar |
|---|---|---|
| 1 | Halaman terbuka | Tampil kotak **Masuk Aplikasi** dengan logo, berwarna (bukan teks polos) |
| 2 | Login Pemilik | Username & password Pemilik → masuk, menu lengkap, nama tampil di kanan atas |
| 3 | Beranda | Kartu ringkasan (pasien hari ini, kas, dst.) terisi |
| 4 | **Ganti password Pemilik** | Ikon 🔑 di kanan atas — **wajib** bila Anda masih memakai password awal dari log setup (Jalur 2) |
| 5 | Pendaftaran → pasien baru → antrian | Data tersimpan; **cek di Google Sheets** muncul baris baru |
| 6 | Login sebagai Dokter di perangkat lain | Antrian pasien muncul otomatis (tanpa perlu refresh) |
| 7 | Resep → apotek → kasir | Alur berjalan sampai struk |
| 8 | Pengaturan → Notifikasi WhatsApp | Token Fonnte tersimpan, "Kirim Tes" berhasil (bila dipakai) |
| 9 | Keluar lalu masuk lagi | Berhasil |
| 10 | Tekan **F12 → Console** | **Tidak ada** pesan merah soal *CORS* |

Bila ada yang gagal → [Troubleshooting](#10-troubleshooting).

---

## 7. BAGIAN D — Setelah berhasil

1. **Beri tahu staf alamat baru** (`https://USERNAME.github.io/NAMA-REPO/`). Pada **Tambahkan ke layar utama / Bookmark** agar mudah dibuka.
2. **Staf perlu login sekali lagi** di alamat baru, karena penyimpanan "Tetap masuk" terikat pada alamat situs.
3. **(Jalur 1) Rapikan backend:** di editor Apps Script hapus file lama yang tidak terpakai: `Index`, `JavaScript`, `Stylesheet` (dan `JavaScriptSurat` bila ada) — klik ⋮ di sebelah nama file → **Delete**. Lalu **Deploy → Manage deployments**: deployment lama (aplikasi versi HTML) boleh di-*Archive* bila sudah tidak dipakai.
4. **Backup harian:** Pengaturan → Backup Data → pastikan "Backup otomatis harian" aktif.
5. **Simpan kode pemulihan Pemilik** (Pengaturan → Keamanan Akun) di tempat aman.

---

## 8. Cara memperbarui di kemudian hari

### Memperbarui tampilan (frontend)
Setelah mengubah file di folder `apotek-praktik-dokter`, buka PowerShell **di folder itu** dan jalankan:
```bash
git add .
git commit -m "Deskripsi singkat perubahan"
git push
```
GitHub Pages memperbarui sendiri dalam 1–2 menit. Bila masih tampil versi lama itu cache browser → **Ctrl+Shift+R** atau jendela Incognito.
*(Opsional: naikkan angka `?v=1.2.0` pada tag `<script>`/`<link>` di `index.html` agar semua perangkat otomatis memuat berkas terbaru.)*

### Memperbarui logika/data (backend)
1. Tempel `Kode.gs` yang baru di editor Apps Script → Save.
2. **Deploy → Manage deployments → ✏️ (edit) → Version: New version → Deploy.**
   ⚠️ Menyimpan saja **tidak cukup** — perubahan backend baru berlaku setelah **versi baru** di-deploy. URL `/exec` **tetap sama**, jadi `config.js` tidak perlu diubah.

### Bila URL backend berubah
(mis. Anda membuat *New deployment* baru) edit `js/config.js` dengan URL baru, lalu `git add . && git commit -m "Ganti URL backend" && git push`.

---

## 9. Apa yang berubah dan tidak berubah

| Hal | Status |
|---|---|
| Fitur, peran, hak akses, alur kerja | ✅ Sama |
| Data (Sheets), akun pengguna, kode pemulihan, token WhatsApp (Jalur 1) | ✅ Sama |
| Keamanan: login & cek peran di server | ✅ Sama |
| Alamat aplikasi | 🔄 Kini `https://USERNAME.github.io/NAMA-REPO/` |
| Tombol **"Saya pemilik skrip: atur ulang tanpa kode"** di Lupa Password | ❌ **Dihapus** — fitur ini memerlukan sesi Google yang tidak tersedia bagi situs di luar Google. Gantinya (cukup 1 klik di editor Apps Script): jalankan fungsi **`resetPasswordPemilik`** (password sementara muncul di Execution log) atau **`buatKodePemulihan`** (kode baru muncul di log) |
| Halaman "terbuka di dalam bingkai Google" | ✅ Hilang — tampilan penuh, tanpa scrollbar ganda |
| Mesin pencari | 🔒 Halaman diberi tanda `noindex` (tidak diindeks Google) karena ini aplikasi internal |
| Respons pertama setelah lama tak dipakai | ⏱️ Bisa 2–5 detik (backend "bangun" dulu); selanjutnya cepat |

---

## 10. Troubleshooting

### Masalah backend / koneksi

| Yang terlihat | Penyebab | Solusi |
|---|---|---|
| Pesan **"Alamat backend belum diisi…"** | `js/config.js` masih berisi `GANTI_DENGAN_URL_EXEC_ANDA` | Isi URL `/exec`, lalu `git add . && git commit -m "isi config" && git push`; Ctrl+Shift+R |
| Pesan **"Tidak dapat terhubung ke server…"** | URL salah ketik, internet putus, atau akses deployment bukan *Anyone* | Buka URL `/exec` di Incognito: harus tampil JSON. Bila tampil halaman login Google → ubah **Who has access = Anyone** lalu deploy versi baru |
| Pesan **"Backend tidak mengembalikan data yang valid…"** | Deployment bukan *Execute as: Me* / *Anyone*, atau backend error | Deploy → Manage deployments → ✏️ → periksa kedua kolom → **New version** → Deploy |
| Console: **CORS policy… blocked** | Hampir selalu akses bukan *Anyone*, atau URL deployment lama/dihapus | Sama seperti di atas; pastikan memakai URL `/exec` (bukan `/dev`) |
| **"Fungsi tidak dikenal"** | Kode lama masih ter-deploy | Tempel `Kode.gs` terbaru → **New version** → Deploy |
| **"Authorization required"** / izin ditolak | Setup belum diizinkan | Jalankan `setupAppEnvironment` di editor → Review permissions → Allow |
| **"Sesi berakhir, silakan login kembali"** | Sesi 6 jam habis / token dicabut | Login ulang (normal) |
| Login benar tapi **"Username atau password salah"** | Salah ketik / akun dikunci 10 menit setelah 5 kali gagal | Tunggu 10 menit; Pemilik dapat mereset akun lain (Pengaturan → Pengguna → ikon 🔑) |
| Lupa password **Pemilik** | — | Pakai **Kode Pemulihan** di halaman masuk → Lupa password; bila kode hilang jalankan `resetPasswordPemilik` di editor Apps Script |
| Data tidak muncul / kosong | Backend memakai Spreadsheet lain | Cek sheet **AppConfig** → `SPREADSHEET_ID`; atau Project Settings → Script properties |
| WhatsApp tidak terkirim | Token Fonnte belum diisi / perangkat Fonnte terputus | Pengaturan → Notifikasi WhatsApp → simpan token → Kirim Tes |

### Masalah GitHub / Git

| Yang terlihat | Penyebab | Solusi |
|---|---|---|
| `fatal: not a git repository` | Belum `git init` atau folder salah | `dir` dulu, pastikan terlihat `index.html`, baru `git init` |
| `remote origin already exists` | Sudah pernah `git remote add` | Lewati; bila URL salah: `git remote set-url origin <url>` |
| `Password authentication is not supported` / `invalid credentials` | GitHub menolak password akun biasa | Buat token (B7) dan tempel sebagai password |
| Tidak ada huruf muncul saat tempel password | Perilaku normal terminal | Tetap tempel lalu Enter |
| `error: src refspec main does not match any` | Belum ada commit | `git add .` lalu `git commit -m "Upload pertama"` |
| `Updates were rejected because the remote contains work` | Repo GitHub punya file (mis. README) yang tidak ada di lokal | `git pull --rebase origin main` lalu `git push` |
| `LF will be replaced by CRLF` | Peringatan format baris Windows | **Abaikan** — bukan error |
| Situs menampilkan versi lama setelah push | Cache browser | **Ctrl+Shift+R** atau Incognito |
| Halaman **tanpa warna/gaya**, Console: *404* untuk `.css`/`.js` | File rata di root (struktur folder rusak) | Lihat [File rata di root](#file-rata-di-root-css--js-404) |
| **404 — File not found** dari GitHub Pages | Folder salah yang di-push, atau `index.html` tidak di root | Lihat [Salah folder yang di-push](#salah-folder-yang-di-push-halaman-404) |

### Salah folder yang di-push (halaman 404)

Gejala: situs 404, semua perintah git berhasil tanpa error, dan di repo GitHub yang terlihat di root adalah **folder** (bukan `index.html`). **Jangan hapus repository.** Push ulang dari folder yang benar:

```powershell
cd "C:\path\ke\apotek-praktik-dokter"      # folder yang LANGSUNG berisi index.html
dir                                         # WAJIB terlihat index.html, css, js
git init
git add .
git commit -m "Fix: push dari folder yang benar"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main --force
```
`--force` berarti **menimpa** isi repository dengan versi lokal. Aman di sini karena isi lama memang struktur yang salah. Tunggu 1–2 menit, lalu Ctrl+Shift+R.

### File rata di root (CSS / JS 404)

Gejala: halaman tampil teks polos; Console (F12) menunjukkan *Failed to load resource: 404* untuk `.css`/`.js`; di repo semua file ada di root tanpa folder `css/` dan `js/`. Perbaiki:

```bash
cd $HOME\Documents
git clone https://github.com/USERNAME/NAMA-REPO.git repo-fix
cd repo-fix
mkdir css
mkdir js
git mv style.css css/style.css
git mv config.js js/config.js
git mv api.js js/api.js
git mv app.js js/app.js
git add .
git commit -m "Kembalikan struktur folder css/ dan js/"
git push
```
(Di Git Bash/Mac/Linux, ganti `$HOME\Documents` dengan `~/Documents`.)

---

## 11. Glosarium

- **Repository (repo)** — folder proyek di GitHub, seperti Google Drive-nya programmer
- **Commit** — menyimpan perubahan dengan catatan singkat (seperti "Save" yang riwayatnya tercatat)
- **Push** — mengirim commit dari komputer ke GitHub (seperti "Upload")
- **Clone** — mengunduh salinan repo dari GitHub ke komputer
- **Branch** — cabang proyek; yang dipakai di sini bernama `main`
- **Personal Access Token** — "password khusus" dari GitHub untuk operasi Git di terminal
- **GitHub Pages** — layanan gratis GitHub untuk menayangkan situs statis
- **Web App (Apps Script)** — skrip Google yang bisa dipanggil lewat alamat URL
- **REST API** — backend yang hanya bertukar data (JSON), tidak menampilkan halaman
- **CORS** — aturan keamanan browser untuk permintaan antar-situs; Apps Script lolos bila permintaan dikirim sebagai `text/plain`
- **Deployment** — versi skrip yang "diterbitkan"; perubahan kode baru berlaku setelah dibuat *New version*

---

## 12. Lampiran: kontrak API

**Alamat:** satu URL `/exec` untuk semuanya.

**GET** `…/exec?action=ping` → cek kesehatan (tanpa data pasien).

**POST** `…/exec` — header `Content-Type: text/plain;charset=utf-8`, body berupa JSON:

| `action` | Isi body | Keterangan |
|---|---|---|
| `login` | `{action, username, pw, ingat}` | Mengembalikan `token` sesi (6 jam) atau token perangkat (30 hari bila `ingat`) |
| `lupaPassword` | `{action, username, kode, baru}` | Reset password Pemilik dengan kode pemulihan |
| `logout` | `{action, token}` | Mencabut token di server |
| `api` | `{action:"api", token, fn, args}` | Semua fitur aplikasi. `fn` = nama fungsi (mis. `boot`, `pasienCari`, `bayar`); hak akses per peran diperiksa di server |

**Respons:** selalu `{"success": true, "data": …}` atau `{"success": false, "message": "…"}`.

Berkas frontend yang berkomunikasi: `js/api.js` (fungsi `gas()`); alamat backend: `js/config.js`.

---

*Selesai. Bila ada langkah yang macet, kirimkan tangkapan layar terminal atau Console browser (F12) agar penyebabnya mudah dilacak.*

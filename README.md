# Aplikasi Apotek & Praktik Mandiri Dokter Spesialis Kulit dan Kelamin — Frontend

Frontend statis (HTML/CSS/JavaScript murni) yang di-hosting di **GitHub Pages**.
Semua data disimpan dan diproses oleh backend **Google Apps Script** (REST API, JSON) dengan Google Sheets sebagai database.

```
Browser (GitHub Pages)  ──fetch POST (text/plain, JSON)──▶  Google Apps Script  ──▶  Google Sheets
   index.html · css · js                                     Kode.gs (REST API)       (database)
```

## Struktur folder (index.html HARUS di root repository)

```
index.html          ← halaman utama (satu-satunya halaman; aplikasi SPA)
css/style.css       ← seluruh gaya tampilan
js/config.js        ← ★ SATU-SATUNYA FILE YANG PERLU DIEDIT: isi GAS_URL
js/api.js           ← lapisan komunikasi ke backend (fetch)
js/app.js           ← seluruh logika aplikasi
img/logo.png        ← logo (ikon tab browser)
.nojekyll           ← memberi tahu GitHub Pages agar tidak memproses file
PANDUAN-INSTALASI.md← panduan lengkap pemasangan backend + frontend
```

## Pemasangan singkat
1. Pasang backend (Kode.gs) di Apps Script dan deploy sebagai Web App → salin URL `/exec`.
2. Edit `js/config.js` → ganti `GANTI_DENGAN_URL_EXEC_ANDA` dengan URL tadi.
3. Dari folder ini: `git init` → `git add .` → `git commit -m "Upload pertama"` → `git push`, lalu aktifkan GitHub Pages.

Langkah rinci ada di **PANDUAN-INSTALASI.md**.

## Memperbarui
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
Tunggu 1–2 menit, lalu tekan **Ctrl+Shift+R** di browser.

> Repository ini publik, tetapi **tidak memuat data pasien maupun kata sandi**. Data hanya ada di Google Sheets Anda dan baru terbuka setelah login.

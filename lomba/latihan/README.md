# Halaman lomba — apa yang boleh diubah, dan di mana

Folder ini adalah satu event. Untuk event baru: **salin folder ini**, lalu ubah
`CFG.event` di `index.html` dan `live.html` (satu baris di masing-masing, dekat
bagian bawah) supaya cocok dengan `lomba_events.slug` di Supabase.

Setelah mengubah apa pun di sini, salin folder ini ke klon `Ayomath-site`,
lalu commit + push. Tidak ada yang perlu di-build.

## Yang datang dari Supabase — JANGAN ditulis di HTML

Ini semua dibaca langsung dari server setiap kali halaman dibuka, supaya
halaman tidak pernah berbeda dari kenyataan pada hari-H:

| Isi | Sumber |
|---|---|
| Nama lomba, tuan rumah, penyelenggara | `lomba_events` |
| Jadwal sesi, kode batch, rentang kelas | `lomba_batches_public` |
| Jumlah soal & lama waktu per kelas | dihitung dari paper yang tersimpan |
| Skor, nama sekolah, jumlah peserta | `lomba_scores` |

Kalau salah satunya perlu berubah, ubah di **Supabase**, bukan di sini.

## Yang diubah lewat berkas di folder ini

### 1. Aturan dan keterangan tambahan → `info.json`

Salin `info.example.json` menjadi `info.json`, lalu sunting.

- **`aturan`** — mengganti SELURUH daftar aturan di halaman depan. Setiap baris:
  `ikon` (emoji), `judul` (tebal), `teks`. Hilangkan kunci `aturan` kalau ingin
  memakai daftar bawaan.
- **`bagian`** — kartu tambahan di bawah aturan: hadiah, lokasi, kontak
  panitia, apa saja. Setiap kartu punya `judul` dan `isi` (daftar paragraf).
- **`judul_aturan`** — mengganti judul "Aturan Lomba".

Tidak ada `info.json`? Halaman memakai daftar aturan bawaan dan tidak
menampilkan kartu tambahan. Aman.

### 2. Sponsor → `sponsors.json` + folder `sponsors/`

Lihat `sponsors/README.md`. Singkatnya: taruh berkas logo di `sponsors/`, lalu
daftarkan namanya di `sponsors.json`. Kosong = seluruh bagian sponsor hilang.

### 3. Selain itu → memang harus menyunting HTML

Tata letak, warna, dan teks di footer ada di dalam `index.html` /`live.html`.
Bagian yang paling mungkin ingin diubah sudah diberi komentar.

## Dua hal yang perlu diingat

**Teks aturan muncul di DUA tempat.** Halaman ini punya daftar lengkapnya;
layar peserta di dalam game punya ringkasan pendek (lima baris, di
`lib/lomba_screen.dart`). Baris "20 soal · 20 menit" di dalam game dibaca dari
server, jadi ikut berubah sendiri kalau formatnya diubah — tetapi kalau aturan
yang lain diubah di sini, ubah juga di sana supaya tidak bertentangan.

**Semua teks dari berkas ini dimasukkan sebagai teks biasa, bukan HTML.**
Menulis `<b>` di dalam `info.json` akan tampil apa adanya sebagai tulisan,
bukan menjadi huruf tebal. Ini disengaja.

# Logo sponsor

Kosong untuk sekarang — **logo ditempel di sini nanti**, tanpa perlu mengubah
HTML sama sekali.

## Cara menambahkan sponsor

1. Salin berkas logonya ke folder ini (`sponsors/`).
   - Format: **PNG, JPG, SVG, atau WebP**. PNG dengan latar transparan paling
     bagus; kalau tidak ada, JPG berlatar putih juga aman — kotak logonya
     memang selalu putih, termasuk saat halaman tampil dalam mode gelap.
   - Ukuran: tinggi sekitar **200–400 px** sudah cukup. Berkas di atas ~300 KB
     sebaiknya dikecilkan dulu; halaman ini sering dibuka lewat data seluler
     di sekolah.
   - Nama berkas: **huruf, angka, titik, dan tanda hubung saja**
     (`dinas-lombok-tengah.png`). Nama dengan spasi atau tanda lain akan
     diabaikan — ini disengaja, supaya halaman lomba tidak bisa dipakai memuat
     gambar dari luar.
2. Daftarkan di `../sponsors.json`. Lihat `../sponsors.example.json` untuk
   contoh lengkapnya.

```json
[
  { "nama": "Nama Sponsor", "berkas": "logo.png", "tingkat": "utama",
    "tautan": "https://situs-sponsor.example" }
]
```

| Kolom | Wajib | Keterangan |
|---|---|---|
| `nama` | ya | Dipakai sebagai teks alternatif, dan ditampilkan kalau gambarnya gagal dimuat. |
| `berkas` | ya | Nama berkas di folder ini. Bukan URL. |
| `tingkat` | tidak | `utama` (kotak besar) atau `pendukung` (kotak kecil). Default `pendukung`. |
| `tautan` | tidak | Harus `https://`. Tanpa ini logo tidak bisa diklik. |

## Yang terjadi kalau dibiarkan kosong

`sponsors.json` berisi `[]`, jadi **seluruh bagian "Didukung oleh" tidak
muncul** — di halaman depan maupun di papan skor. Halaman tetap terlihat utuh,
bukan seperti halaman yang belum jadi. Begitu ada satu sponsor terdaftar,
bagian itu muncul dengan sendirinya.

## Setelah menambahkan

Salin folder ini ke `Ayomath-site` seperti biasa (berkas per berkas — jangan
menghapus folder tujuan; lihat `website/README.md`). Tidak ada yang perlu
di-build dan tidak ada kode yang berubah.

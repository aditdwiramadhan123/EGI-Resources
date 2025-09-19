

# 1. Arsitektur Backend E-Commerce untuk 10.000 Pengguna

**Soal:** Anda diminta merancang sistem backend untuk aplikasi e-commerce yang mendukung 10.000 pengguna bersamaan. Sistem ini terdiri dari beberapa layanan: API Gateway, User Service, Product Service, dan Order Service, semuanya berjalan secara independen. Jelaskan:

---

## a. Bagaimana Anda akan menerapkan load balancing secara efisien antar instance layanan?

Agar server tidak down kalau banyak user:

* Semua request user masuk lewat **API Gateway**.
* **Load Balancer** (misal: Nginx, HAProxy, ELB) mengatur request ke instance service.
* Cara distribusi: **Round Robin** atau **Least Connection**.
* Contoh:

  * User Service: 3 instance → LB kirim request merata.
  * Product Service: 5 instance → prinsip sama.
* **Manfaat**:

  * Kalau satu instance mati, LB otomatis alihkan ke yang lain.
  * Response lebih cepat, tidak menumpuk di satu server.

---

## b. Bagaimana Anda akan mengelola session state secara terdistribusi tanpa menggunakan session pada server?

**Session Stateless Tanpa Server**

* **JWT (JSON Web Token)**:

  * User login → server kasih token (user\_id, role, dll).
  * Token disimpan di browser/local storage.
  * Request API → sertakan token di header `Authorization`.
* **Keuntungan**:

  * Semua instance bisa verifikasi user sendiri.
  * Server tetap stateless → autoscaling gampang.

---

## c. Jelaskan dengan rinci bagaimana Anda bisa menggunakan caching (misalnya Redis) untuk meminimalkan beban ke database.

**Caching agar DB tidak berat menggunakan Redis:**

* **Product Service**:

  * Produk jarang berubah → cek cache dulu.
  * Ada di cache → langsung kasih ke user.
  * Tidak ada → ambil dari DB → simpan ke cache (TTL 5 menit misal).
* **Order Service**:

  * Bisa cache status order terakhir.
  * Jangan cache data yang sering berubah lama-lama.

**Manfaat**:
Cepat, DB tidak ke-overload

---

# 2. Middleware Logging Node.js (Express.js)

**Soal:** Buat middleware dalam Node.js (Express.js) yang mencatat informasi request dan response secara mendalam, tetapi tanpa mencatat data sensitif (password, token, credit card). Tambahkan fitur:
a. Mencatat waktu eksekusi request.
b. Mendeteksi jika request lebih dari 1 detik → log warning.
c. Menyimpan log ke file dan juga mengirim ke sistem monitoring (structured JSON).
d. Gunakan async/await untuk track request lifetime.

---

**Project:** Express.js Logging Middleware (TypeScript)

**Tujuan:** Middleware untuk mencatat log request & response, tracking durasi request, menandai request >1 detik, dan menyaring field sensitif sebelum disimpan.

**Struktur folder:**

```
project-root/
├── logs/   
│   └── app.log/          → berisi daftar log
├── src/
│   ├── middlewares/      → berisi middleware logging
│   ├── routes/           → berisi router endpoint, contoh /api/payment/checkout
│   ├── lib/              → helper untuk log file dan monitoring
│   ├── app.ts            → setup Express app dan register middleware
│   └── server.ts         → entry point server
├── logs/                 → file log tersimpan di sini
├── tsconfig.json
├── package.json
├── package-lock.json
└── .env
```

**Cara Pakai:**

1. Install dependencies:

   ```bash
   npm install
   ```
2. Isi `.env` sesuai contoh.
3. Jalankan mode development:

   ```bash
   npm run dev
   ```
4. Tes endpoint:

   ```
   POST http://localhost:3000/api/payment/checkout
   Content-Type: application/json

   {
     "userId": "123",
     "amount": 50000,
     "creditCard": "4111111111111111"
   }
   ```
5. Cek log di `logs/app.log` → field sensitif otomatis jadi `***REDACTED***`.

---

# 3. Optimasi Performa Aplikasi React dengan 1000 Item

**Soal:** Aplikasi React Anda memiliki 1000 item dalam daftar, dan ketika user scroll, performa jadi rendah. Ini terjadi karena re-render berulang, terutama saat filter digunakan. Jelaskan:

* Apa akar permasalahannya?
* Bagaimana cara mengoptimalkannya?

---

**Akar Permasalahan:**

* Re-render seluruh daftar: setiap perubahan state (misal filter) memicu render ulang semua 1000 item.
* Filtering di client: memproses semua item setiap render → berat untuk browser.
* Tidak ada virtualisasi: semua elemen di DOM sekaligus → scroll lag.
* Komponen tidak memoized: item yang sama tetap re-render saat parent berubah.

**Cara Mengoptimalkan:**

1. **Backend pagination + server-side filter**
   Hanya kirim sebagian data dan hasil filter dari server → frontend lebih ringan.
2. **Memoization di frontend**
   Gunakan `React.memo` untuk item list, `useMemo` untuk hasil filter → hindari re-render tidak perlu.
3. **List virtualization**
   Pakai `react-window` atau `react-virtualized` → render hanya item yang terlihat di viewport.
4. **Optimasi props & callback**
   Gunakan `useCallback` / `useMemo` untuk function atau object di props agar item tidak re-render tanpa perlu.
5. **(Opsional) Frontend pagination / infinite scroll**
   Render batch item bila backend tidak paginasi → kurangi DOM nodes sekaligus.

---

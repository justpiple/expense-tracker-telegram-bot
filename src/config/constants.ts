import { TIME_ZONE } from "./env";

export const EXPENSE_EXTRACTION_PROMPT = (
  categories: string[],
  accounts: string[],
) => `
Anda adalah sistem yang dapat dalam mengekstrak informasi dari pesan teks atau gambar.

Instruksi:
1.  Baca pesan teks dan perhatikan gambar (jika ada) dengan untuk mengidentifikasi semua informasi pengeluaran yang relevan. Jika pesan teks dan gambar diberikan bersamaan, gabungkan informasi dari kedua sumber untuk mendapatkan detail informasi.
2.  Untuk setiap pengeluaran, ekstrak detail berikut:
    * "description": Deskripsi pengeluaran yang jelas dan lengkap dari gambar atau pesan.
    * "amount": Jumlah pengeluaran dalam angka.
    * "date": Tanggal pengeluaran dalam format YYYY-MM-DD.
    * "subcategory": Subkategori pengeluaran. (Jika ada kategori dalam pesan, simpulkan kategori berdasarkan deskripsi. Apabila tetap tidak cocok, buat kategori baru dengan format: new: Nama Kategori.)
    * "account": Metode pembayaran. Ekstrak informasi metode pembayaran dari pesan teks jika ada dan sesuai dengan daftar yang tersedia. Contoh: jika pesan teks mengatakan 'pakai cash', maka 'account' adalah 'Cash' jika terdapat didaftar akun yang tersedia.
3.  **PENTING:** Jika pesan mengandung beberapa pengeluaran, pisahkan menjadi objek terpisah dalam array JSON.
4.  Identifikasi pengeluaran yang berbeda menggunakan kata kunci seperti "dan", "serta", "juga", "lalu", "kemudian" atau frasa gabungan yang mengindikasikan beberapa transaksi.
5.  Jika pesan atau gambar tidak mengandung informasi pengeluaran, kembalikan array kosong.

Daftar Kategori (subcategory) yang Tersedia: ${categories.join(", ")}
Daftar Akun (account) pembayaran yang Tersedia: ${accounts.join(", ")}

Tanggal Hari Ini: ${new Date().toLocaleDateString("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})}

Contoh Output:
-   Beberapa pengeluaran:
    { "expenses": [
    {"description":"Makan siang di Kantin","amount":75000,"date":"2025-04-04","subcategory":"Food","account":"GoPay"},
    {"description":"Parkir","amount":10000,"date":"2025-04-04","subcategory":"Transportation","account":"Cash"}
    ] }
-   Tunggal:
    { "expenses" : [
    {"description" : "Bensin","amount": 25000, "date" : "2024-01-01", "subcategory" : "Transportation", "account" : "Cash"}
    ] }

Pesan Teks:
`;

export const BOT_MESSAGES = {
  WELCOME: `
Hai\\! 👋 Selamat datang di *Expense Tracker Bot*\\!

Bot ini bakal bantu kamu catat pengeluaran langsung ke *Notion* dengan mudah\\.

🔹 *Cara Pakai:*  
• Tinggal kirim pesan yang isinya detail pengeluaran kamu  
• Atau kirim *foto struk* dengan *caption* detailnya

🔸 *Contoh Pesan:*  
• \\"Beli kopi 25rb di Starbucks pakai BCA\\"  
• \\"Bayar listrik 250rb kategori Utilities\\"  
• \\"Makan siang 50rb tanggal 3 April\\"

⌨️ Ketik \`/help\` kalau butuh bantuan lebih lengkap ya\\!
`,

  HELP: `
  *🔍 BANTUAN PENGGUNAAN BOT*
  
  *📝 FORMAT INPUT:*
  • Deskripsi pengeluaran  
  • Jumlah\\/harga \\(dalam *rb\\/ribu\\/k* atau *jt\\/juta\\/m*\\)  
  • Tanggal \\(opsional, default: hari ini\\)  
  • Kategori \\(opsional\\)  
  • Akun pembayaran *\\(wajib\\)*
  
  *📋 CONTOH PESAN:*
  • \\"Beli kopi 25rb di Starbucks pakai BCA\\"  
  • \\"Makan siang 50rb tanggal 3 April kategori Food pakai Cash\\"  
  • \\"Bayar listrik 1\\.5jt via Mandiri kategori Utilities\\"
  
  *📊 MULTIPLE EXPENSES:*
  • Kamu bisa kirim beberapa pengeluaran dalam satu pesan  
  • Pisahkan dengan baris baru atau tanda pemisah yang jelas  
  • Contoh: \\"Sarapan 35rb pakai BCA\\. Beli bensin 50rb pakai Cash\\"
  
  *📸 MENGIRIM STRUK:*
  • Kirim *foto struk* dengan *caption* yang berisi detail pengeluaran  
  • Format caption sama seperti format pesan teks  
  • Catatan: Struk hanya bisa dilampirkan untuk *satu pengeluaran*
  
  *➕ MEMBUAT KATEGORI BARU:*
  • Tambahkan \`new: Nama Kategori\` atau \`baru: Nama Kategori\`  
  • Contoh: \\"Beli buku 150rb kategori \`new: Pendidikan\` pakai BCA\\"
  
  *🔎 PERINTAH TERSEDIA:*
  \`/categories\` \\- Menampilkan daftar kategori yang tersedia  
  \`/accounts\` \\- Menampilkan daftar akun yang tersedia  
  \`/help\` \\- Menampilkan bantuan ini  
  \`/start\` \\- Pesan sambutan
  
  *💡 TIPS:*
  • Semakin detail pesan Anda, semakin akurat pencatatan  
  • Selalu sebutkan *kategori* untuk konsistensi laporan  
  • Jangan lupa mencantumkan *akun pembayaran* \\(wajib\\)  
  • Foto struk membantu melacak pengeluaran lebih detail
  `,
  EXPENSE_FAILURE: `
❌ Maaf, saya tidak dapat memahami informasi pengeluaran.

Mohon coba lagi dengan format yang lebih jelas, contoh:
• "Beli kopi 25rb di starbucks pakai BCA"
• "Makan siang 50rb tanggal 3 April pakai Cash"
  `,

  ACCOUNT_MISSING: `
⚠️ Akun pembayaran harus disebutkan untuk pengeluaran kamu.

Tolong sebutkan akun pembayaran yang digunakan, contoh:
• "pakai BCA"
• "via Gopay"
• "dengan Cash"

Atau pilih dari akun berikut:
  `,

  CATEGORIES_FETCH_ERROR: `
❌ Gagal mengambil daftar kategori.

Kemungkinan penyebab:
• Masalah koneksi dengan API Notion
• Database kategori tidak tersedia

Silakan coba lagi nanti atau hubungi admin.
  `,

  PHOTO_MISSING_CAPTION: `
Mohon sertakan detail pengeluaran dalam caption foto.

Contoh caption:
"Pakai BCA"
  `,

  PHOTO_PROCESSING_ERROR: `
❌ Terjadi kesalahan saat memproses foto.

Silakan coba lagi dengan:
• Kualitas foto yang lebih baik
• Caption yang lebih jelas
• Koneksi internet yang stabil
  `,

  EXPENSE_ERROR: `
❌ Ups, ada masalah saat menyimpan pengeluaran kamu.

Mungkin karena:
- Format tanggal kurang tepat
- Akun yang kamu sebutkan belum ada di database
- Koneksi ke Notion lagi bermasalah

Coba lagi ya.
  `,

  NOT_EXPENSE_MESSAGE: `
Sepertinya pesan kamu bukan pengeluaran. Jika ingin mencatat pengeluaran, silakan gunakan format seperti:

"Beli kopi 25rb pakai BCA"
"Makan siang 75rb tanggal 5 April pakai Cash"

Ketik /help untuk bantuan lebih lanjut.
  `,
  ACCOUNT_NOT_FOUND: (accountName: string, accounts: string[]) => `
⚠️ Akun "${accountName}" tidak ditemukan dalam database.

Silakan pilih dari akun yang tersedia:
${accounts.join(", ")}

Atau ketik /accounts untuk melihat daftar lengkap.
`,
};

export const CACHE_TTL = 1000 * 60 * 30;

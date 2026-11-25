# Tahap 1: Eksplorasi ide dan perancangan solusi
  Kami para pengembang menggunakan AI dalam perancangan fitur yang akan ditambahkan dalam sebuah web interaktif bernama UjianKu yang berfungsi sebagai web anti kecurangan. AI memberikan rekomendasi fitur seperti: fitur anti curang(deteksi perpindahan tab dan mode layar penuh), memblokir shortcut, mengacak soal, bank soal( guru dapat mengedit, membuat, dan mengelompokkan soal, mengatur waktu ujian), pemantauan ujian secara real time, menyimpan jawaban secara otomatis, indikator waktu dan navigasi soal, rekap nilai secara otomatis. 

# Tahap 2: Penyusunan kerangka kode
  Kami melakukan perancangan kode setelah semua fitur dirasa lengkap, meminta AI untuk mengirimkan kode HTML yang sudah memiliki tailwind JS maupun CSS. Kami menggunakan fitur Canvas Gemini untuk memantau keberhasilan dan kelancaran web yang sedang dibuat(simulasi). Kami juga mengubah nama situs yang semula "UjianKu - web" menjadi "UjianKu - Solusi Guru Masa Kini" sesuai preferensi pribadi. 

# Tahap 3: Pemecahan masalah dan penanganan galat 
  AI kami beberapa kali melakukan kesalahan pada saat men-generate kode yang mengharuskan kami untuk terus mensimulasikan web tepat setelah kode tersebut berhasil di-generate melalui Canvas. Kami melakukan tiap simulasi secara mendetail untuk memastikan fitur yang digenerate memberikan hasil yang diinginkan. Pada sebagian besar simulasi, kami menuliskan prompt untuk menambahkan fitur baru yang mungkin akan berguna kedepannya, dan jika ada fitur yang tidak bisa diakses maupun hilang, kami akan meminta AI untuk menambahkan maupun memperbaiki fitur tersebut secara spesifik(sebelum kami melakukan revisi secara manual jika terdapat kesalahan yang tidak bisa diperbaiki lebih dari lima kali).

# Tahap 4: Refleksi dan penjelasan kode
  Melalui bantuan AI pada tahap debugging dan generate kode, kami jadi memahami bahwa kita bisa:
  1. menggunakan url "https://cdn.tailwindcss.com" untuk menulis kode CSS tanpa meninggalkan HTML
  2. menggunakan CloudFlare untuk menghasilkan web yang aman dan cepat
  3. menambahkan animasi dalam <style>
  4. melakukan pemindahan data ke excel, pdf, dan word melalui "fa-solid fa-file-excel", nama excel bisa diganti sesuai aplikasi kerja yang kita mau
Dan ternyata membuat web yang dapat berfungsi dengan fitur yang kami inginkan lebih mudah dari yang kami kira

import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { generateDummyAthletes } from "../dummy";\n', '')

old_block = r'''      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-4">
        <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <HardDriveDownload size={18} className="text-amber-600" />
          Pengujian Bagan Otomatis \(Dummy Data\)
        </h3>
        <p className="text-xs text-amber-700 font-semibold leading-relaxed leading-normal">
          Klik tombol di bawah untuk membuat data 2-50 atlet dummy secara acak untuk SETIAP kelas aktif yang bukan kategori bebas. 
          Gunakan aksi ini hanya jika database Anda masih kosong atau saat menguji sistem bagan pertandingan!
        </p>
        <div className="flex flex-wrap gap-3.5">
          <button
            onClick=\{async \(\) => \{
              if \(window\.confirm\("Apakah Anda yakin ingin menginjeksi ratusan/ribuan atlet palsu ke dalam sistem ini\? Aksi ini akan mempengaruhi beban Firestore Anda\."\)\) \{
                try \{
                  showToast\("Memproses injeksi data atlet dummy ke Firestore\.\.\. Harap tunggu\."\);
                  await generateDummyAthletes\(localSettings\);
                  showToast\("Berhasil memasukkan data atlet dummy ke seluruh kelas pertandingan!"\);
                \} catch \(e\) \{
                  console\.error\(e\);
                  alert\("Gagal menginjeksi data\. Periksa konsol\."\);
                \}
              \}
            \}\}
            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-\[10px\] px-6 py-3\.5 rounded-2xl transition-all shadow-md uppercase"
          >
            🧪 GENERATE DUMMY ATLET \(2-50 / KELAS\)
          </button>
        </div>
      </div>'''

content = re.sub(old_block, '', content, flags=re.MULTILINE)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)


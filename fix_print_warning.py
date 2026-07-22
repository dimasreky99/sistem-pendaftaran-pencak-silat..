with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_header = """          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚙️</span> Pengaturan Kertas & Jadwal Cetak (Pratinjau)
            </h2>
            <div className="flex gap-2">
              <button"""

new_header = """          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚙️</span> Pengaturan Kertas & Jadwal Cetak (Pratinjau)
              </h2>
              <p className="text-[10px] text-rose-600 font-bold mt-1">Jika tombol tidak merespon, buka aplikasi di Tab Baru (Open in New Tab).</p>
            </div>
            <div className="flex gap-2">
              <button"""

content = content.replace(old_header, new_header)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)

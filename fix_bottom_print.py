with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_bottom = """        {/* PRINT TRIGGER BUTTONS FOR INTERACTION */}
        <div className="mb-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase print:hidden">
          <div>Menampilkan {filteredMatches.length} partai aktif</div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg">Cetak</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-200 text-slate-850 px-3 py-1.5 rounded-lg">Kembali</button>
          </div>
        </div>"""

new_bottom = """        {/* PRINT TRIGGER BUTTONS FOR INTERACTION */}
        <div className="mb-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase print:hidden">
          <div>Menampilkan {filteredMatches.length} partai aktif <br/><span className="text-rose-500">(Buka tab baru jika tombol cetak tidak berfungsi)</span></div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg">Cetak</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-200 text-slate-850 px-3 py-1.5 rounded-lg">Kembali</button>
          </div>
        </div>"""

content = content.replace(old_bottom, new_bottom)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)

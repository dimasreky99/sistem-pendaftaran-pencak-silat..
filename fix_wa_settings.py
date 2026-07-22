with open('src/types.ts', 'r') as f:
    content = f.read()
content = content.replace('bestFighterScheme?:', 'adminWaNumber?: string;\n  bestFighterScheme?:')
with open('src/types.ts', 'w') as f:
    f.write(content)

with open('src/constants.ts', 'r') as f:
    content = f.read()
content = content.replace('bestFighterScheme: "Prestasi"', 'adminWaNumber: "6282123456789",\n  bestFighterScheme: "Prestasi"')
with open('src/constants.ts', 'w') as f:
    f.write(content)

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()
    
# Add the UI input for adminWaNumber
input_ui = """                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">WhatsApp Master Admin</label>
                  <input
                    type="text"
                    value={formData.adminWaNumber || ""}
                    onChange={(e) => setFormData({ ...formData, adminWaNumber: e.target.value })}
                    className="w-full bg-white border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Contoh: 6282123456789 (tanpa + atau 0)"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Nomor ini akan menerima notifikasi pendaftaran kontingen dan atlet baru.</p>
                </div>"""
content = content.replace('<div>\n                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">Rekening Pembayaran / Info Kontak</label>', input_ui + '\n\n                <div>\n                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">Rekening Pembayaran / Info Kontak</label>')
with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
print("Done WA settings")

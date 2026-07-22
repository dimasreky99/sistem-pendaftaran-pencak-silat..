import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

new_ui = """                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">No. Awal Invoice (Prefix Angka)</label>
                      <input
                        type="number"
                        value={localSettings.invoiceCounter || 1000}
                        onChange={(e) => handleUpdateBasic("invoiceCounter", parseInt(e.target.value) || 1000)}
                        placeholder="Contoh: 1000"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
"""

content = re.sub(
    r'(<div>\s*<label className="text-xs font-bold text-slate-700 block mb-1\.5">Nama Bendahara Panitia \(Cetak Invoice\)</label>)', 
    new_ui + r'\1', 
    content
)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
print("Done fixing invoice counter regex")

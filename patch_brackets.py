import re

with open('src/components/BracketsModule.tsx', 'r') as f:
    content = f.read()

# Add indicator in the select options
option_old = """                  <option key={cl} value={cl}>
                    {isClassSaved ? "✅ [TERSURAT] " : "⏳ [KOSONG] "} {cl} ({count} Calon Peserta)
                  </option>"""
option_new = """                  <option key={cl} value={cl}>
                    {isClassSaved ? "✅ [TERSURAT] " : "⏳ [KOSONG] "} {cl} ({count} Calon Peserta) {count >= 2 && count <= 10 ? "[Skala Kecil]" : count > 10 ? "[Skala Besar]" : ""}
                  </option>"""
content = content.replace(option_old, option_new)

# Add indicator badge next to the participant count
info_old = """                <span>Terdapat <span className="text-emerald-600">{classAthletes.length} Atlet Valid</span></span>"""
info_new = """                <div className="flex items-center gap-2">
                  <span>Terdapat <span className="text-emerald-600">{classAthletes.length} Atlet Valid</span></span>
                  {classAthletes.length >= 2 && classAthletes.length <= 10 && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Skala Kecil
                    </span>
                  )}
                  {classAthletes.length >= 11 && (
                    <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Skala Besar
                    </span>
                  )}
                </div>"""
content = content.replace(info_old, info_new)

with open('src/components/BracketsModule.tsx', 'w') as f:
    f.write(content)


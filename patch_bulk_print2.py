import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'      case "id-card-cetak":.*?        \);'

new_id_card_cetak = """      case "id-card-cetak":
        return (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                  Cetak Massal ID Card Badge Lanyard
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Pilih satu atau lebih kontingen untuk mencetak ID Card massal.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkIdCardsTargets(contingents.filter(c => c.role === "kontingen").map(c => c.contingentName))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={() => setBulkIdCardsTargets([])}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {bulkIdCardsTargets.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  {contingents
                    .filter(c => c.role === "kontingen")
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setBulkIdCardsTargets(prev => prev.includes(c.contingentName) ? prev.filter(p => p !== c.contingentName) : [...prev, c.contingentName])}
                        className={`p-4 border rounded-2xl text-left transition-all space-y-1.5 ${
                          bulkIdCardsTargets.includes(c.contingentName)
                            ? "bg-emerald-50 border-emerald-500 shadow-sm shadow-emerald-100 ring-2 ring-emerald-500/20"
                            : "bg-slate-50 border-slate-150 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                           <strong className="text-xs font-bold text-slate-800 block truncate">{c.contingentName}</strong>
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${bulkIdCardsTargets.includes(c.contingentName) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                             {bulkIdCardsTargets.includes(c.contingentName) && <span className="text-white text-[10px]">✓</span>}
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {athletes.filter(a => a.kontingen === c.contingentName && a.isAcc).length} Atlet Ter-ACC
                        </span>
                      </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  {contingents
                    .filter(c => c.role === "kontingen")
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setBulkIdCardsTargets(prev => prev.includes(c.contingentName) ? prev.filter(p => p !== c.contingentName) : [...prev, c.contingentName])}
                        className={`p-4 border rounded-2xl text-left transition-all space-y-1.5 ${
                          bulkIdCardsTargets.includes(c.contingentName)
                            ? "bg-emerald-50 border-emerald-500 shadow-sm shadow-emerald-100 ring-2 ring-emerald-500/20"
                            : "bg-slate-50 border-slate-150 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                           <strong className="text-xs font-bold text-slate-800 block truncate">{c.contingentName}</strong>
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${bulkIdCardsTargets.includes(c.contingentName) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                             {bulkIdCardsTargets.includes(c.contingentName) && <span className="text-white text-[10px]">✓</span>}
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {athletes.filter(a => a.kontingen === c.contingentName && a.isAcc).length} Atlet Ter-ACC
                        </span>
                      </button>
                    ))}
                </div>
            )}
          </div>
        );"""

content = re.sub(pattern, new_id_card_cetak, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

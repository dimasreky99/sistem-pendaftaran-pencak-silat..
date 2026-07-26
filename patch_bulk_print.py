import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const [bulkIdCardsTarget, setBulkIdCardsTarget] = useState<string | null>(null);',
    'const [bulkIdCardsTargets, setBulkIdCardsTargets] = useState<string[]>([]);'
)

# In case "id-card-cetak":
old_id_card_cetak = """      case "id-card-cetak":
        return (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                Cetak Massal ID Card Badge Lanyard
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Tampilkan list ID Card atlet dari kontingen spesifik untuk print massal.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {contingents
                .filter(c => c.role === "kontingen")
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => setBulkIdCardsTarget(c.contingentName)}
                    className="p-4 bg-slate-50 border border-slate-150 hover:border-red-600 rounded-2xl text-left transition-all space-y-1.5"
                  >
                    <strong className="text-xs font-bold text-slate-800 block truncate">{c.contingentName}</strong>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {athletes.filter(a => a.kontingen === c.contingentName && a.isAcc).length} Atlet Ter-ACC
                    </span>
                  </button>
                ))}
            </div>
          </div>
        );"""

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
                {bulkIdCardsTargets.length > 0 && (
                  <button
                    onClick={() => {
                       // Just let the view render IdCardPreview by the condition later in the render loop.
                       // Actually, we don't need a button here if the selection is handled in active view.
                       // Wait, if bulkIdCardsTargets has length > 0, the main workspace will render IdCardPreview automatically based on the condition below.
                       // But the condition below is `bulkIdCardsTargets.length > 0 ? <IdCardPreview...`
                       // Let's just keep it as is.
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Tampilkan {bulkIdCardsTargets.length} Kontingen
                  </button>
                )}
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
            ) : null}
          </div>
        );"""

content = content.replace(old_id_card_cetak, new_id_card_cetak)

# Update reset handlers
content = content.replace('setBulkIdCardsTarget(null)', 'setBulkIdCardsTargets([])')

# Update rendering conditions
content = content.replace(
    'bulkIdCardsTarget ? "no-print" : ""',
    'bulkIdCardsTargets.length > 0 ? "no-print" : ""'
)

old_bulk_print = """              ) : bulkIdCardsTarget ? (
                /* BULK PRINT LAYOUT */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <IdCardPreview
                    athletes={(() => {
                      const tgt = contingents.find(c => c.contingentName === bulkIdCardsTarget);
                      const officials = tgt ? [
                        { name: tgt.pjName || "Penanggung Jawab", kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "mgr", isOfficial: true, officialRole: "MANAGER", photoUrl: tgt.managerPhotoUrl },
                        ...(tgt.official1Name || tgt.official1PhotoUrl ? [{ name: tgt.official1Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official1PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL" }]),
                        ...(tgt.official2Name || tgt.official2PhotoUrl ? [{ name: tgt.official2Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official2PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL" }])
                      ] : [];
                      return [...officials, ...athletes.filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc)];
                    })()}
                    settings={settings}
                    onCancel={() => setBulkIdCardsTargets([])}
                  />
                </motion.div>"""

new_bulk_print = """              ) : bulkIdCardsTargets.length > 0 ? (
                /* BULK PRINT LAYOUT */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <IdCardPreview
                    athletes={(() => {
                      let allTargetAthletes: any[] = [];
                      for (const t of bulkIdCardsTargets) {
                          const tgt = contingents.find(c => c.contingentName === t);
                          const officials = tgt ? [
                            { name: tgt.pjName || "Penanggung Jawab", kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `mgr-${tgt.id}`, isOfficial: true, officialRole: "MANAGER", photoUrl: tgt.managerPhotoUrl },
                            ...(tgt.official1Name || tgt.official1PhotoUrl ? [{ name: tgt.official1Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off1-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official1PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off1-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL" }]),
                            ...(tgt.official2Name || tgt.official2PhotoUrl ? [{ name: tgt.official2Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off2-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official2PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off2-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL" }])
                          ] : [];
                          allTargetAthletes = [...allTargetAthletes, ...officials, ...athletes.filter(a => a.kontingen === t && a.isAcc)];
                      }
                      return allTargetAthletes;
                    })()}
                    settings={settings}
                    onCancel={() => setBulkIdCardsTargets([])}
                  />
                </motion.div>"""

content = content.replace(old_bulk_print, new_bulk_print)

# Update print overlay
old_print_overlay = """          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {/* If printing bulk */}
            {bulkIdCardsTarget && (
              <div className="flex flex-wrap justify-start gap-8 bg-white p-0">
                {athletes
                  .filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc)
                  .map(a => {"""

new_print_overlay = """          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {/* If printing bulk */}
            {bulkIdCardsTargets.length > 0 && (
              <div className="flex flex-wrap justify-start gap-8 bg-white p-0">
                {athletes
                  .filter(a => bulkIdCardsTargets.includes(a.kontingen) && a.isAcc)
                  .map(a => {"""

content = content.replace(old_print_overlay, new_print_overlay)

with open('src/App.tsx', 'w') as f:
    f.write(content)

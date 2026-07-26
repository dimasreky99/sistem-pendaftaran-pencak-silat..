import re

with open('src/components/DashboardContingent.tsx', 'r') as f:
    content = f.read()

rekap_block = """
      {/* Rekap Kelas */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-tight">Rekap Kelas & Kategori</h3>
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-5 text-center" style={{ width: "60px" }}>No</th>
                  <th className="py-3 px-5">Kategori & Kelas</th>
                  <th className="py-3 px-5 text-center">Putra</th>
                  <th className="py-3 px-5 text-center">Putri</th>
                  <th className="py-3 px-5 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-xs">
                {(() => {
                  const rekapMap: Record<string, { putra: number; putri: number }> = {};
                  let totalPutra = 0;
                  let totalPutri = 0;
                  
                  // Use 'athletes' prop which contains all athletes for this contingent
                  // filteredAthletes is affected by search query, so we use 'athletes' for accurate rekap
                  athletes.forEach(a => {
                    const key = `${a.kategori} - ${a.kelas.replace(/ \\[(?:Aktual|Validasi):.*?\\]/g, "")}`;
                    if (!rekapMap[key]) rekapMap[key] = { putra: 0, putri: 0 };
                    if (a.jk === "Putra") {
                      rekapMap[key].putra++;
                      totalPutra++;
                    } else if (a.jk === "Putri") {
                      rekapMap[key].putri++;
                      totalPutri++;
                    }
                  });
                  
                  const sortedKeys = Object.keys(rekapMap).sort();
                  
                  if (sortedKeys.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">Belum ada data atlet didaftarkan.</td>
                      </tr>
                    );
                  }
                  
                  return (
                    <>
                      {sortedKeys.map((key, idx) => (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-5 text-slate-900 font-bold">{key}</td>
                          <td className="py-3 px-5 text-center">{rekapMap[key].putra > 0 ? <span className="text-blue-600 font-black">{rekapMap[key].putra}</span> : "-"}</td>
                          <td className="py-3 px-5 text-center">{rekapMap[key].putri > 0 ? <span className="text-rose-600 font-black">{rekapMap[key].putri}</span> : "-"}</td>
                          <td className="py-3 px-5 text-center font-black text-slate-900">{rekapMap[key].putra + rekapMap[key].putri}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 text-slate-900 font-black text-sm">
                        <td colSpan={2} className="py-4 px-5 text-right uppercase tracking-wider">Total Keseluruhan</td>
                        <td className="py-4 px-5 text-center text-blue-700">{totalPutra}</td>
                        <td className="py-4 px-5 text-center text-rose-700">{totalPutri}</td>
                        <td className="py-4 px-5 text-center text-emerald-700">{totalPutra + totalPutri} Atlet</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Athletes Header Actions */}"""

content = content.replace('      {/* Athletes Header Actions */}', rekap_block)

with open('src/components/DashboardContingent.tsx', 'w') as f:
    f.write(content)

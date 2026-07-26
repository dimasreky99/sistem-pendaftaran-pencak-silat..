import re

with open('src/components/DashboardContingent.tsx', 'r') as f:
    content = f.read()

athletes_table_start = r'      {/\* Desktop Athletes Table \*/}'

rekap_kelas_block = """      {/* REKAP KELAS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm mb-6">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Rekap Kelas (Kontingen {contingent.contingentName})
        </h3>
        <div className="space-y-6">
          {Object.keys(settings.classData).filter(cat => filteredAthletes.some(a => a.kategori === cat)).map((cat, idx) => {
            const catAthletes = filteredAthletes.filter(a => a.kategori === cat);
            const classGroups = catAthletes.reduce((acc: any, a) => {
              const k = a.kelas;
              if (!acc[k]) acc[k] = { Putra: 0, Putri: 0 };
              acc[k][a.jk]++;
              return acc;
            }, {});
            return (
              <div key={cat} className="space-y-2">
                <h4 className="font-bold text-slate-700 text-xs uppercase bg-slate-50 p-2 rounded-lg border border-slate-100">{cat}</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/50 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3 text-center">Putra</th>
                        <th className="py-2.5 px-3">Kelas</th>
                        <th className="py-2.5 px-3 text-center">Putri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {Object.keys(classGroups).sort().map((k, i) => (
                        <tr key={k} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 text-center text-sky-600 font-black">{classGroups[k].Putra || '-'}</td>
                          <td className="py-2 px-3 text-slate-800 uppercase text-[10px]">{k}</td>
                          <td className="py-2 px-3 text-center text-pink-600 font-black">{classGroups[k].Putri || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {filteredAthletes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <div className="flex justify-between items-center text-sm font-black text-slate-800">
                <span>TOTAL ATLET KESELURUHAN:</span>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg">{filteredAthletes.length} Atlet</span>
              </div>
            </div>
          )}
          {filteredAthletes.length === 0 && (
            <div className="text-center text-slate-400 font-semibold text-xs py-4">Belum ada atlet.</div>
          )}
        </div>
      </div>

"""

content = content.replace(athletes_table_start, rekap_kelas_block + athletes_table_start)

with open('src/components/DashboardContingent.tsx', 'w') as f:
    f.write(content)

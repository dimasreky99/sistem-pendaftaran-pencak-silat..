import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_code = """            {/* Pagination Controls */}
            {maxPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2">"""

new_code = """            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="uppercase tracking-wider">Tampilkan:</span>
                <select
                  value={globalAthletePerPage}
                  onChange={(e) => {
                    setGlobalAthletePerPage(e.target.value === "ALL" ? "ALL" : Number(e.target.value));
                    setGlobalAthletePage(1);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer text-slate-800 shadow-sm"
                >
                  <option value={10}>10 Data</option>
                  <option value={20}>20 Data</option>
                  <option value={50}>50 Data</option>
                  <option value="ALL">Semua Data</option>
                </select>
              </div>
              
              {maxPages > 1 && (
                <div className="flex justify-center items-center gap-2">"""

content = content.replace(old_code, new_code)

old_code_2 = """                <button
                  disabled={currentPageSafe >= maxPages}
                  onClick={() => setGlobalAthletePage(prev => Math.min(prev + 1, maxPages))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  SELANJUTNYA ▶
                </button>
              </div>
            )}
          </div>
        );
"""

new_code_2 = """                <button
                  disabled={currentPageSafe >= maxPages}
                  onClick={() => setGlobalAthletePage(prev => Math.min(prev + 1, maxPages))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  SELANJUTNYA ▶
                </button>
                </div>
              )}
            </div>
          </div>
        );
"""

content = content.replace(old_code_2, new_code_2)

with open('src/App.tsx', 'w') as f:
    f.write(content)

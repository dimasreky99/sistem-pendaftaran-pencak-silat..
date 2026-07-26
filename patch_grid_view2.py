import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# Modify header for Daftar Atlet Belum di-ACC
old_header_unconf = """              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
                    Daftar Atlet Belum di-ACC
                  </h3>
                  <p className="text-xs text-rose-500 mt-1.5 font-semibold">Total: {athletes.filter(a => !a.isAcc).length} Atlet Menunggu Audit</p>
                </div>
                <button 
                  onClick={() => setViewingUnconfirmed(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base px-6 py-3.5 rounded-xl transition-all border-2 border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  ✕ KEMBALI KE HALAMAN SEBELUMNYA
                </button>
              </div>"""

new_header_unconf = """              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
                    Daftar Atlet Belum di-ACC
                  </h3>
                  <p className="text-xs text-rose-500 mt-1.5 font-semibold">Total: {athletes.filter(a => !a.isAcc).length} Atlet Menunggu Audit</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      title="Tampilan Tabel"
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      title="Tampilan Grid/Galeri"
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setViewingUnconfirmed(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base px-6 py-3.5 rounded-xl transition-all border-2 border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                  >
                    ✕ KEMBALI KE HALAMAN SEBELUMNYA
                  </button>
                </div>
              </div>"""

content = content.replace(old_header_unconf, new_header_unconf)

# Modify table rendering for Unconfirmed Athletes
old_table_unconf = """              {/* Table of Unconfirmed Athletes */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                      <th className="py-4 px-5">Nama Lengkap</th>
                      <th className="py-4 px-5">Kontingen</th>
                      <th className="py-4 px-5">NIK / Tgl Lahir</th>
                      <th className="py-4 px-5">Kategori & Kelas</th>
                      <th className="py-4 px-5 text-center" style={{ width: "220px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {athletes.filter(a => !a.isAcc).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Semua atlet sudah di-ACC!
                        </td>
                      </tr>
                    ) : (
                      athletes.filter(a => !a.isAcc).map((atlet, index) => {
                        const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                        return (
                          <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                            <td className="py-4 px-5 font-bold text-slate-900">{atlet.name}</td>
                            <td className="py-4 px-5 text-slate-500">
                              {atlet.kontingen}
                            </td>
                            <td className="py-4 px-5 text-slate-600">
                              <div>{atlet.nik}</div>
                              <div className="text-xs text-slate-400 font-semibold">{atlet.tglLahir}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-emerald-800 font-bold">{atlet.kategori}</span>
                              <div className="text-xs text-slate-500 font-semibold mt-0.5">{displayClass}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => onSelectAthleteForDetail(atlet)}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                                >
                                  Periksa Berkas Lengkap
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => onToggleAcc(atlet.id!)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                  >
                                    Terima (ACC)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt("Catatan Revisi untuk Kontingen:");
                                      if (notes !== null) onRejectAthlete(atlet.id!, notes);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                  >
                                    Revisi
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>"""

new_table_unconf = """              {/* View Mode content for Unconfirmed Athletes */}
              {viewMode === "table" ? (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                        <th className="py-4 px-5">Nama Lengkap</th>
                        <th className="py-4 px-5">Kontingen</th>
                        <th className="py-4 px-5">NIK / Tgl Lahir</th>
                        <th className="py-4 px-5">Kategori & Kelas</th>
                        <th className="py-4 px-5 text-center" style={{ width: "220px" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {athletes.filter(a => !a.isAcc).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Semua atlet sudah di-ACC!
                          </td>
                        </tr>
                      ) : (
                        athletes.filter(a => !a.isAcc).map((atlet, index) => {
                          const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                          return (
                            <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                              <td className="py-4 px-5 font-bold text-slate-900">{atlet.name}</td>
                              <td className="py-4 px-5 text-slate-500">
                                {atlet.kontingen}
                              </td>
                              <td className="py-4 px-5 text-slate-600">
                                <div>{atlet.nik}</div>
                                <div className="text-xs text-slate-400 font-semibold">{atlet.tglLahir}</div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="text-emerald-800 font-bold">{atlet.kategori}</span>
                                <div className="text-xs text-slate-500 font-semibold mt-0.5">{displayClass}</div>
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => onSelectAthleteForDetail(atlet)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                                  >
                                    Periksa Berkas Lengkap
                                  </button>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => onToggleAcc(atlet.id!)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                    >
                                      Terima (ACC)
                                    </button>
                                    <button
                                      onClick={() => {
                                        const notes = prompt("Catatan Revisi untuk Kontingen:");
                                        if (notes !== null) onRejectAthlete(atlet.id!, notes);
                                      }}
                                      className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                    >
                                      Revisi
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {athletes.filter(a => !a.isAcc).length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl">
                      Semua atlet sudah di-ACC!
                    </div>
                  ) : (
                    athletes.filter(a => !a.isAcc).map((atlet, index) => {
                      const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                      return (
                        <div key={atlet.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                          <div className="aspect-square w-full bg-slate-100 overflow-hidden relative group">
                            {atlet.fotos[0] ? (
                              <img src={atlet.fotos[0]} alt={atlet.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <User size={64} className="opacity-50" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="bg-amber-500 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-sm">
                                PENDING
                              </span>
                            </div>
                            <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[10px] font-black px-2 py-1 rounded-md backdrop-blur-sm">
                              {atlet.jk}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h4 className="font-extrabold text-slate-900 text-sm mb-1 line-clamp-1" title={atlet.name}>{atlet.name}</h4>
                            <div className="text-xs text-slate-500 font-semibold mb-1 line-clamp-1">{atlet.kontingen}</div>
                            
                            <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
                              <div>
                                <div className="text-emerald-700 font-extrabold text-xs">{atlet.kategori}</div>
                                <div className="text-slate-500 font-semibold text-[11px]">{displayClass}</div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <button
                                  onClick={() => onSelectAthleteForDetail(atlet)}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition-all shadow-sm"
                                >
                                  Periksa Berkas Lengkap
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => onToggleAcc(atlet.id!)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                  >
                                    Terima (ACC)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt("Catatan Revisi untuk Kontingen:");
                                      if (notes !== null) onRejectAthlete(atlet.id!, notes);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                  >
                                    Revisi
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}"""

content = content.replace(old_table_unconf, new_table_unconf)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)


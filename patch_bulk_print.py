import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Instead of the custom mapping, replace the bulkIdCardsTarget layout to use IdCardPreview
old_bulk = """              ) : bulkIdCardsTarget ? (
                /* BULK PRINT LAYOUT */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between no-print">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm uppercase">Cetak Massal: {bulkIdCardsTarget}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Menggabungkan badge seluruh atlet tervalidasi ACC dari kontingen ini.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all"
                      >
                        PRINT MASSAL (PDF)
                      </button>
                      <button
                        onClick={() => setBulkIdCardsTarget(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-200"
                      >
                        Kembali
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-6 p-6 bg-slate-100 rounded-3xl print:bg-white print:p-0">
                    {athletes
                      .filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc)
                      .map(a => {
                        let photoUrl = a.fotos[0] || "";
                        const bgThemes: Record<string, string> = {
                          slate: "from-slate-900 via-slate-800 to-slate-950 text-white border border-slate-800",
                          red: "from-red-950 via-red-900 to-slate-950 text-white border border-red-950",
                          green: "from-emerald-950 via-emerald-900 to-slate-950 text-white border border-emerald-950",
                          blue: "from-blue-950 via-blue-900 to-slate-950 text-white border border-blue-950",
                          terate: "from-zinc-950 via-zinc-900 to-black text-white border-2 border-zinc-800"
                        };
                        const activeBg = bgThemes[settings.idCardBgColor] || bgThemes.slate;

                        return (
                          <div 
                            key={a.id}
                            className={`relative w-[280px] h-[400px] rounded-2xl overflow-hidden shadow-md text-center flex flex-col justify-between p-4 bg-gradient-to-b page-break-inside-avoid ${activeBg}`}
                            style={{
                              backgroundImage: settings.idCardBg ? `url(${settings.idCardBg})` : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center"
                            }}
                          >
                            {!settings.idCardBg && <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />}
                            
                            <div className="flex flex-col items-center mt-1">
                              {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 max-w-[80%] object-contain mb-1" />}
                              <h4 className="font-black text-[9px] text-white tracking-widest uppercase truncate max-w-full drop-shadow">
                                {settings.eventTitle}
                              </h4>
                            </div>

                            <div className="w-[85px] h-[108px] bg-slate-800/80 border border-slate-700/60 rounded-xl mx-auto flex items-center justify-center overflow-hidden">
                              {photoUrl ? <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" /> : <div className="text-slate-500 text-[8px] font-black uppercase">PAS FOTO<br/>3X4</div>}
                            </div>

                            <div className="space-y-0.5">
                              <h3 className="font-black text-xs uppercase text-slate-100 truncate max-w-full tracking-tight">{a.name}</h3>
                              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">{a.kontingen}</span>
                            </div>

                            <div className="w-[94%] mx-auto bg-slate-950/80 backdrop-blur-[2px] border border-slate-800 rounded-xl p-2 text-center">
                              <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">{a.kategori}</div>
                              <div className="text-[9px] font-black text-slate-200 uppercase truncate">{a.kelas.replace(/Prestasi\s*\|\s*/, "").replace(/Pemasalan\s*\|\s*/, "")}</div>
                            </div>

                            <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">ID PESERTA</div>
                          </div>
                        );
                      })}
                    {athletes.filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc).length === 0 && (
                      <p className="text-sm font-semibold text-slate-400 text-center py-12">Belum ada atlet ber-status ACC yang tervalidasi untuk dicetak.</p>
                    )}
                  </div>
                </motion.div>
              ) : ("""

new_bulk = """              ) : bulkIdCardsTarget ? (
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
                    onCancel={() => setBulkIdCardsTarget(null)}
                  />
                </motion.div>
              ) : ("""

# Replace old_bulk but there's a risk of mismatch, so let's use string.replace
if old_bulk in content:
    content = content.replace(old_bulk, new_bulk)
else:
    print("Not found! Fallback to regex or manual")

with open('src/App.tsx', 'w') as f:
    f.write(content)

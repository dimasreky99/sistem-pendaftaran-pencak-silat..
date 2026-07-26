with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

officials_html = """            </div>

            {currentUser.role !== "admin" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Data ID Card Official Kontingen</h3>
                <p className="text-[10px] text-slate-500 font-semibold mb-3">Lengkapi foto Manager & Official untuk dicetak di ID Card.</p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Manager / PJ</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                      {managerPhotoUrl ? (
                        <img src={managerPhotoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                      )}
                    </div>
                    <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                      Upload Foto
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setManagerPhotoUrl)} />
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nama Official 1</label>
                    <input type="text" value={official1Name} onChange={(e) => setOfficial1Name(e.target.value)} placeholder="Nama Lengkap Official 1" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Official 1</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                        {official1PhotoUrl ? (
                          <img src={official1PhotoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                        )}
                      </div>
                      <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                        Upload Foto
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setOfficial1PhotoUrl)} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nama Official 2</label>
                    <input type="text" value={official2Name} onChange={(e) => setOfficial2Name(e.target.value)} placeholder="Nama Lengkap Official 2" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Official 2</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                        {official2PhotoUrl ? (
                          <img src={official2PhotoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                        )}
                      </div>
                      <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                        Upload Foto
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setOfficial2PhotoUrl)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button"""

content = content.replace("            </div>\n\n            <button", officials_html)

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)

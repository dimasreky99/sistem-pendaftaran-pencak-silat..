with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# I want to add an invoice editor field in the list of contingents.
old_ui = """                        <div className="flex gap-2">
                          {c.paymentStatus === "Belum Lunas" ? (
                            <button
                              onClick={() => {
                                if(confirm(`Tandai Kontingen ${c.contingentName} sebagai LUNAS?`)) {
                                  onUpdateContingentPaymentStatus(c.id, "Lunas");
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                              + Konfirmasi Lunas
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if(confirm(`Batalkan status Lunas untuk Kontingen ${c.contingentName}?`)) {
                                  onUpdateContingentPaymentStatus(c.id, "Belum Lunas");
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                              - Batalkan Lunas
                            </button>
                          )}
                        </div>"""

new_ui = """                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {c.paymentStatus === "Belum Lunas" ? (
                              <button
                                onClick={() => {
                                  if(confirm(`Tandai Kontingen ${c.contingentName} sebagai LUNAS?`)) {
                                    onUpdateContingentPaymentStatus(c.id, "Lunas");
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                + Konfirmasi Lunas
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if(confirm(`Batalkan status Lunas untuk Kontingen ${c.contingentName}?`)) {
                                    onUpdateContingentPaymentStatus(c.id, "Belum Lunas");
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                - Batalkan Lunas
                              </button>
                            )}
                          </div>
                          {onUpdateInvoiceNumber && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] font-bold text-slate-500">Kustom INV:</span>
                              <input 
                                type="text"
                                placeholder={`INV-${String((settings.invoiceCounter || 1000) + c.kodeUnik).padStart(3, "0")}`}
                                value={c.customInvoiceNumber || ""}
                                onChange={(e) => onUpdateInvoiceNumber(c.id, e.target.value)}
                                className="w-32 px-2 py-1 text-[10px] font-mono border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>"""

content = content.replace(old_ui, new_ui)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)
print("Done fix invoice ui")

import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# Edit the table header
header_old = """                  <th className="py-3.5 px-4 text-center">Bukti Bayar</th>"""
header_new = """                  <th className="py-3.5 px-4">Invoice</th>
                  <th className="py-3.5 px-4 text-center">Bukti Bayar</th>"""
content = content.replace(header_old, header_new)

# Edit the table row
row_old = """                      {/* Bill and Status */}"""
row_new = """                      {/* Invoice */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          {contingent.customInvoiceNumber ? (
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                              {contingent.customInvoiceNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic">Belum di-generate</span>
                          )}
                          <button
                            onClick={() => {
                              const newInv = prompt("Masukkan Nomor Invoice Khusus (kosongkan untuk hapus):", contingent.customInvoiceNumber || "");
                              if (newInv !== null && onUpdateInvoiceNumber) {
                                onUpdateInvoiceNumber(contingent.id, newInv || "");
                              }
                            }}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline decoration-emerald-200 underline-offset-2 w-fit transition-all"
                          >
                            Edit Nomor
                          </button>
                        </div>
                      </td>
                      {/* Bill and Status */}"""
content = content.replace(row_old, row_new)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)


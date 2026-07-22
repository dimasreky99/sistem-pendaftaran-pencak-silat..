import re

with open('src/components/PembayaranContingentView.tsx', 'r') as f:
    content = f.read()

old_code = """              <div className="flex gap-2">

                <button
                  onClick={() => setShowPrintInvoice(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FileText size={14} /> Cetak Invoice
                </button>
              </div>"""

new_code = """              <div className="flex items-center gap-2">
                {contingent.paymentStatus === "Lunas" ? (
                  <button
                    onClick={() => setShowPrintInvoice(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileText size={14} /> Cetak Invoice
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-500 font-semibold max-w-[200px] text-right italic">
                    Jika terkonfirmasi lunas maka invoice akan muncul.
                  </p>
                )}
              </div>"""

content = content.replace(old_code, new_code)

with open('src/components/PembayaranContingentView.tsx', 'w') as f:
    f.write(content)

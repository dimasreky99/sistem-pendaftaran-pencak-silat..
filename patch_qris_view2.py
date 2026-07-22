import re

with open('src/components/PembayaranContingentView.tsx', 'r') as f:
    content = f.read()

# Check if we need to add paymentMethod state
if "const [paymentMethod" not in content:
    content = content.replace('const [showPrintInvoice, setShowPrintInvoice] = useState(false);', 'const [showPrintInvoice, setShowPrintInvoice] = useState(false);\n  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "QRIS">(settings.qrisPhotoUrl ? "QRIS" : "TRANSFER");')

old_code = """            {settings.paymentInfo && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 text-xs font-semibold whitespace-pre-wrap leading-relaxed mt-4 print:hidden">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">Informasi & Petunjuk Rekening Pembayaran / Transfer Bank</span>
                {settings.paymentInfo}
              </div>
            )}
            
            {settings.qrisPhotoUrl && (
              <div className="p-4 bg-white border border-slate-150 rounded-2xl flex flex-col items-center mt-4 print:hidden shadow-sm">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-3 text-center">Atau Scan QRIS untuk Pembayaran</span>
                <img src={settings.qrisPhotoUrl} alt="QRIS" className="w-full max-w-[200px] h-auto rounded-xl border border-slate-200" />
              </div>
            )}"""

new_code = """            {settings.qrisPhotoUrl && (
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200 mt-4 max-w-sm print:hidden">
                <button
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-md transition-all ${paymentMethod === "TRANSFER" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Transfer Bank
                </button>
                <button
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-md transition-all ${paymentMethod === "QRIS" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  QRIS
                </button>
              </div>
            )}
            
            {settings.paymentInfo && (!settings.qrisPhotoUrl || paymentMethod === "TRANSFER") && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 text-xs font-semibold whitespace-pre-wrap leading-relaxed mt-4 print:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">Informasi & Petunjuk Rekening Pembayaran / Transfer Bank</span>
                {settings.paymentInfo}
              </div>
            )}
            
            {settings.qrisPhotoUrl && paymentMethod === "QRIS" && (
              <div className="p-4 bg-white border border-slate-150 rounded-2xl flex flex-col items-center mt-4 print:hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-3 text-center">Scan QRIS untuk Pembayaran</span>
                <img src={settings.qrisPhotoUrl} alt="QRIS" className="w-full max-w-[250px] h-auto rounded-xl border border-slate-200" />
              </div>
            )}"""

content = content.replace(old_code, new_code)

with open('src/components/PembayaranContingentView.tsx', 'w') as f:
    f.write(content)

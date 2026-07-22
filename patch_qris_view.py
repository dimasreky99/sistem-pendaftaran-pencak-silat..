import re

with open('src/components/PembayaranContingentView.tsx', 'r') as f:
    content = f.read()

old_code = """            {settings.paymentInfo && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 text-xs font-semibold whitespace-pre-wrap leading-relaxed mt-4 print:hidden">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">Informasi & Petunjuk Rekening Pembayaran</span>
                {settings.paymentInfo}
              </div>
            )}"""

new_code = """            {settings.paymentInfo && (
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

content = content.replace(old_code, new_code)

with open('src/components/PembayaranContingentView.tsx', 'w') as f:
    f.write(content)

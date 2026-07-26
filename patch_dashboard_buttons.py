import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

buttons_block = """
      <div className="flex items-center justify-between mb-6 bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse"></span>
          <span className="text-slate-300 text-sm font-semibold">Tindakan Sistem:</span>
        </div>
        <div className="flex gap-2">
          <label className="font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
            <span>📥 Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => {
              if (!isConfirmingReset) {
                setIsConfirmingReset(true);
                setTimeout(() => {
                  setIsConfirmingReset(false);
                }, 4000);
              } else {
                setIsConfirmingReset(false);
                onTriggerRefresh();
                setToastMessage("Data berhasil dimuat ulang.");
                setTimeout(() => {
                  setToastMessage(null);
                }, 5000);
              }
            }}
            className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              isConfirmingReset 
                ? "bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-500 animate-pulse" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
             {isConfirmingReset ? "👉 KLIK LAGI UNTUK KONFIRMASI RESET DATA!" : "Refresh Data"}
          </button>
        </div>
      </div>
"""

content = content.replace('{/* Main View Grid */}', buttons_block + '\n      {/* Main View Grid */}')

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)

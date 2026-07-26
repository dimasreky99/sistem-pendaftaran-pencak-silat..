import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern = r'             \{isConfirmingReset \? "👉 KLIK LAGI UNTUK KONFIRMASI RESET DATA!" : "Refresh Data"\}\s+</button>\s+</div>\s+</div>'
new_code = """             {isConfirmingReset ? "👉 KLIK LAGI UNTUK KONFIRMASI RESET DATA!" : "Refresh Data"}
          </button>
          
          <button
            onClick={() => onPrintLaporan()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <FileText size={14} /> Cetak Laporan PDF
          </button>
        </div>
      </div>"""

content = re.sub(pattern, new_code, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)

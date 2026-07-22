with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

import re

# Add export CSV function
if "const handleExportCsv = () => {" not in content:
    func_csv = """
  const handleExportCsv = () => {
    const headers = ["PARTAI", "HARI", "SESI", "KONTINGEN MERAH", "NAMA MERAH", "NAMA BIRU", "KONTINGEN BIRU", "KELAS", "BABAK"];
    const rows = filteredMatches.map(m => {
      const getSession = (m: ScheduledMatch) => {
        const override = manualOverrides[`${m.className}_${m.round}_${m.matchIndex}`];
        if (override && override.session) return override.session;
        return getDayAndSessionCalc(m.partaiNum).session;
      };
      const getDayNumber = (m: ScheduledMatch) => {
        const override = manualOverrides[`${m.className}_${m.round}_${m.matchIndex}`];
        if (override && override.dayNum) return override.dayNum;
        return getDayAndSessionCalc(m.partaiNum).dayNum;
      };
      return [
        m.partaiNum,
        getDayNumber(m),
        getSession(m),
        m.p1?.kontingen || "",
        m.p1?.nama || "MENUNGGU",
        m.p2?.nama || "MENUNGGU",
        m.p2?.kontingen || "",
        m.className,
        m.roundName
      ].map(x => `"${x}"`).join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_Pertandingan_${selectedGelanggang}_${selectedSession}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
"""
    content = content.replace("const triggerPrint = () => {", func_csv + "\n  const triggerPrint = () => {")

# Update buttons
old_buttons = """            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
              >
                🖨️ Cetak Jadwal
              </button>
              <button
                onClick={() => setIsPrinting(false)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-1.5 rounded-lg transition-all text-xs"
              >
                Kembali
              </button>
            </div>"""

new_buttons = """            <div className="flex gap-2">
              <button
                onClick={handleExportCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
              >
                📊 Excel (CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
              >
                🖨️ Cetak PDF / Print
              </button>
              <button
                onClick={() => setIsPrinting(false)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-1.5 rounded-lg transition-all text-xs"
              >
                Kembali
              </button>
            </div>"""

content = content.replace(old_buttons, new_buttons)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix print buttons")

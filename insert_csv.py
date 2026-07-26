with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

func_csv = """  const handleExportCsv = () => {
    const headers = ["PARTAI", "HARI", "SESI", "KONTINGEN MERAH", "NAMA MERAH", "NAMA BIRU", "KONTINGEN BIRU", "KELAS", "BABAK", "ARENA"];
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
      
      let redName = m.p1 ? m.p1.nama : `Pemenang Partai #${m.feeder1Partai}`;
      let redCont = m.p1 ? m.p1.kontingen : "-";
      let blueName = m.p2 ? m.p2.nama : `Pemenang Partai #${m.feeder2Partai}`;
      let blueCont = m.p2 ? m.p2.kontingen : "-";

      if (m.p1?.isPlaceholder) {
        redName = "Belum Diundi";
        redCont = "-";
      }
      if (m.p2?.isPlaceholder) {
        blueName = "Belum Diundi";
        blueCont = "-";
      }

      return [
        m.partaiNum,
        getDayNumber(m),
        getSession(m),
        redCont,
        redName,
        blueName,
        blueCont,
        m.className,
        m.roundName,
        m.arena || "2"
      ].map(x => `"${x}"`).join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_Pertandingan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
"""

content = content.replace('  if (isPrinting) {', func_csv + '\n  if (isPrinting) {')

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)

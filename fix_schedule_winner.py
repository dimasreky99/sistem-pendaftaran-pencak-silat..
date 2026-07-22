with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_logic = """  const handleDeclareWinner = (m: ScheduledMatch, playerNum: 1 | 2) => {
    if (userRole !== "admin") {
      alert("Hanya Admin yang dapat meng-klik dan menentukan pemenang pertandingan.");
      return;
    }

    const competitor = playerNum === 1 ? m.p1 : m.p2;
    if (!competitor || competitor.isBye || competitor.isPlaceholder) {
      alert("Belum ada kompetitor siap bertanding di sudut ini.");
      return;
    }"""

new_logic = """  const handleDeclareWinner = (m: ScheduledMatch, playerNum: 1 | 2) => {
    if (userRole !== "admin") {
      alert("Hanya Admin yang dapat meng-klik dan menentukan pemenang pertandingan.");
      return;
    }

    const competitor = playerNum === 1 ? m.p1 : m.p2;
    if (!competitor || competitor.isBye || competitor.isPlaceholder) {
      alert("Belum ada kompetitor siap bertanding di sudut ini.");
      return;
    }
    
    // 2-Step Verification for changes
    if (m.winner) {
      if (m.winner.nama === competitor.nama) return; // already winner
      const step1 = window.confirm(`Peringatan: Pemenang sudah ditentukan yaitu ${m.winner.nama}. Anda yakin ingin MENGUBAH pemenang menjadi ${competitor.nama}?`);
      if (!step1) return;
      const step2 = window.confirm(`Konfirmasi Langkah 2: Mengubah pemenang akan mereset jadwal bagan di depannya. Apakah Anda BENAR-BENAR yakin?`);
      if (!step2) return;
    } else {
      const step1 = window.confirm(`Tetapkan ${competitor.nama} sebagai pemenang?`);
      if (!step1) return;
    }
"""

content = content.replace(old_logic, new_logic)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix schedule winner")

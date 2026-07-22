with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_logic = """    // 2-Step Verification for changes
    if (m.winner) {
      if (m.winner.nama === competitor.nama) return; // already winner
      const step1 = window.confirm(`Peringatan: Pemenang sudah ditentukan yaitu ${m.winner.nama}. Anda yakin ingin MENGUBAH pemenang menjadi ${competitor.nama}?`);
      if (!step1) return;
      const step2 = window.confirm(`Konfirmasi Langkah 2: Mengubah pemenang akan mereset jadwal bagan di depannya. Apakah Anda BENAR-BENAR yakin?`);
      if (!step2) return;
    } else {
      const step1 = window.confirm(`Tetapkan ${competitor.nama} sebagai pemenang?`);
      if (!step1) return;
    }"""

new_logic = """    // 2-Step Verification for changes
    if (m.winner) {
      if (m.winner.nama === competitor.nama) {
        const confirmCancel = window.confirm(`Batalkan kemenangan ${competitor.nama}? Jadwal bagan di depannya akan direset.`);
        if (!confirmCancel) return;
      } else {
        const step1 = window.confirm(`Peringatan: Pemenang sudah ditentukan yaitu ${m.winner.nama}. Anda yakin ingin MENGUBAH pemenang menjadi ${competitor.nama}?`);
        if (!step1) return;
        const step2 = window.confirm(`Konfirmasi Langkah 2: Mengubah pemenang akan mereset jadwal bagan di depannya. Apakah Anda BENAR-BENAR yakin?`);
        if (!step2) return;
      }
    } else {
      const step1 = window.confirm(`Tetapkan ${competitor.nama} sebagai pemenang?`);
      if (!step1) return;
    }"""

content = content.replace(old_logic, new_logic)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)

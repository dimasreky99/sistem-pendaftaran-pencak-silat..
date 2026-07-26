with open('src/App.tsx', 'r') as f:
    content = f.read()

listener_logic = """
  // Global Event Listener for Archive and Reset
  useEffect(() => {
    const handleArchiveAndReset = () => {
      try {
        const wb = XLSX.utils.book_new();
        const athletesSheet = XLSX.utils.json_to_sheet(athletes.map(a => ({
          ID: a.id, Nama: a.name, NIK: a.nik, "Tanggal Lahir": a.tglLahir,
          "Jenis Kelamin": a.jk, Kategori: a.kategori, Kelas: a.kelas,
          Kontingen: a.kontingen, WhatsApp: a.nowa,
          Status: a.isAcc ? "ACC" : "BELUM ACC"
        })));
        XLSX.utils.book_append_sheet(wb, athletesSheet, "Data Atlet");

        const contingentsSheet = XLSX.utils.json_to_sheet(contingents.filter(c => c.role !== 'admin').map(c => ({
          ID: c.id, "Nama Kontingen": c.contingentName, "Penanggung Jawab": c.pjName,
          Username: c.username, WhatsApp: c.nowa, "Status Pembayaran": c.paymentStatus
        })));
        XLSX.utils.book_append_sheet(wb, contingentsSheet, "Data Kontingen");

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Backup_Turnamen_${dateStr}.xlsx`);
        
        // Now using our new setAthletes wrapper which actually deletes elements
        setAthletes([]);
        setContingents(prev => prev.filter(c => c.role === 'admin'));
        alert("Data berhasil diarsipkan dan diunduh. Database turnamen telah direset.");
      } catch (err) {
        console.error("Archive error:", err);
        alert("Terjadi kesalahan saat mengarsipkan data.");
      }
    };
    window.addEventListener('archive-and-reset-db', handleArchiveAndReset);
    return () => window.removeEventListener('archive-and-reset-db', handleArchiveAndReset);
  }, [athletes, contingents, setAthletes, setContingents]);

"""

target = '  // --- APPLICATION STATE ---'
if 'handleArchiveAndReset' not in content:
    content = content.replace(target, listener_logic + target)

with open('src/App.tsx', 'w') as f:
    f.write(content)

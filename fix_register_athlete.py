with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logic = """      setAthletes(prev => [...prev, newAtlet]);
      appendLog("TAMBAH ATLET", `Mendaftarkan atlet: ${athleteData.name} (${athleteData.nik})`);
    }"""

new_logic = """      setAthletes(prev => [...prev, newAtlet]);
      appendLog("TAMBAH ATLET", `Mendaftarkan atlet: ${athleteData.name} (${athleteData.nik})`);
      
      // WA Notification
      const adminNum = systemSettings.adminWaNumber || "6282123456789";
      const waMessage = encodeURIComponent(`*PENDAFTARAN ATLET BARU*\n\nNama Atlet: ${athleteData.name}\nNIK: ${athleteData.nik}\nKontingen: ${athleteData.kontingen}\n\nMohon validasi kelengkapan berkas atlet ini.`);
      const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
      window.open(waUrl, "_blank");
    }"""

content = content.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done WA register athlete")

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'      appendLog\("TAMBAH ATLET", `Mendaftarkan atlet: \$\{athleteData\.name\} \(\$\{athleteData\.nik\}\)`\);\s+\}\s+setIsEditingAthlete\(false\);'
new_code = """      appendLog("TAMBAH ATLET", `Mendaftarkan atlet: ${athleteData.name} (${athleteData.nik})`);
      
      const waMessage = `*PENDAFTARAN ATLET BARU*\\n\\nNama Atlet: ${athleteData.name}\\nNIK: ${athleteData.nik}\\nKontingen: ${athleteData.kontingen}\\n\\nMohon validasi kelengkapan berkas atlet ini.`;
      sendAutoWhatsApp(waMessage, settings);
    }

    setIsEditingAthlete(false);"""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

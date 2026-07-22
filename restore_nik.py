import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_nik_check = """      // NEW REGISTRATION MODE
      // Pengecekan NIK duplikat telah dinonaktifkan"""

new_nik_check = """      // NEW REGISTRATION MODE
      const dupNik = athletes.some(a => a.nik === athleteData.nik);
      if (dupNik) {
        alert("Pendaftaran Gagal: NIK atlet ini sudah terdaftar sebelumnya!");
        return;
      }"""

content = content.replace(old_nik_check, new_nik_check)

with open('src/App.tsx', 'w') as f:
    f.write(content)

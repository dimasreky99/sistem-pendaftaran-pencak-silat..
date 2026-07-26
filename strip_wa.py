import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Pendaftaran Kontingen
pattern1 = r'    // WA Notification\s+const adminNum = settings.adminWaNumber \|\| "6282123456789";\s+const waMessage = encodeURIComponent\(`\*PENDAFTARAN KONTINGEN BARU\*\\n\\nNama Kontingen: \$\{konti\}\\nPenanggung Jawab: \$\{pj\}\\nNo WA: \$\{hp\}\\n\\nMohon validasi kontingen ini.`\);\s+const waUrl = `https://wa.me/\$\{adminNum\}\?text=\$\{waMessage\}`;\s+window.open\(waUrl, "_blank"\);'

# 2. Pendaftaran Atlet Baru
pattern2 = r'      // WA Notification\s+const adminNum = settings.adminWaNumber \|\| "6282123456789";\s+const waMessage = encodeURIComponent\(`\*PENDAFTARAN ATLET BARU\*\n\nNama Atlet: \$\{athleteData\.name\}\nNIK: \$\{athleteData\.nik\}\nKontingen: \$\{athleteData\.kontingen\}\n\nMohon validasi kelengkapan berkas atlet ini\.`\);\s+const waUrl = `https://wa\.me/\$\{adminNum\}\?text=\$\{waMessage\}`;\s+window\.open\(waUrl, "_blank"\);'

# 3. Bukti Pembayaran
pattern3 = r'    // WA Notification\s+const adminNum = settings.adminWaNumber \|\| "6282123456789";\s+const waMessage = encodeURIComponent\(`\*UPLOAD BUKTI PEMBAYARAN\*\\n\\nKontingen: \$\{contingentName\}\\nTelah mengunggah bukti pembayaran di sistem\.\\n\\nSilakan cek dan validasi pembayaran pada menu Admin\.`\);\s+const waUrl = `https://wa\.me/\$\{adminNum\}\?text=\$\{waMessage\}`;\s+window\.open\(waUrl, "_blank"\);'

content = re.sub(pattern1, '', content, flags=re.DOTALL)
content = re.sub(pattern2, '', content, flags=re.DOTALL)
content = re.sub(pattern3, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

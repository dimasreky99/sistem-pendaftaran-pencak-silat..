import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'    appendLog\("UPLOAD BUKTI", `Kontingen \$\{contingentName\} mengunggah bukti pembayaran`\);\s+\s+\};'
new_code = """    appendLog("UPLOAD BUKTI", `Kontingen ${contingentName} mengunggah bukti pembayaran`);
    
    const waMessage = `*UPLOAD BUKTI PEMBAYARAN*\\n\\nKontingen: ${contingentName}\\nTelah mengunggah bukti pembayaran di sistem.\\n\\nSilakan cek dan validasi pembayaran pada menu Admin.`;
    sendAutoWhatsApp(waMessage, settings);
  };"""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_cont = """    setRegPjName("");
    setRegNowa("");
    setRegContingentName("");
    setRegUsername("");
    setRegPassword("");
    setActiveView("login");"""

new_cont = """    setRegPjName("");
    setRegNowa("");
    setRegContingentName("");
    setRegUsername("");
    setRegPassword("");
    setActiveView("login");
    
    // WA Notification
    const adminNum = settings.adminWaNumber || "6282123456789";
    const waMessage = encodeURIComponent(`*PENDAFTARAN KONTINGEN BARU*\\n\\nNama Kontingen: ${konti}\\nPenanggung Jawab: ${pj}\\nNo WA: ${hp}\\n\\nMohon validasi kontingen ini.`);
    const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
    window.open(waUrl, "_blank");"""

content = content.replace(old_cont, new_cont)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fix WA cont")

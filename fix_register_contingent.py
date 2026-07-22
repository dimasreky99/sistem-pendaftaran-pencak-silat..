with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logic = """    setRegPjName("");
    setRegNowa("");
    setRegContingentName("");
    setRegUsername("");
    setRegPassword("");
    setShowRegister(false);
    
    alert(`Pendaftaran Berhasil! Silakan login dengan username: ${u}`);"""

new_logic = """    setRegPjName("");
    setRegNowa("");
    setRegContingentName("");
    setRegUsername("");
    setRegPassword("");
    setShowRegister(false);
    
    // WA Notification
    const adminNum = systemSettings.adminWaNumber || "6282123456789";
    const waMessage = encodeURIComponent(`*PENDAFTARAN KONTINGEN BARU*\n\nNama Kontingen: ${konti}\nPenanggung Jawab: ${pj}\nNo WA: ${hp}\n\nMohon validasi kontingen ini.`);
    const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
    window.open(waUrl, "_blank");

    alert(`Pendaftaran Berhasil! Silakan login dengan username: ${u}`);"""

content = content.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done WA register contingent")

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logic = """  const handleUploadReceipt = (contingentName: string, base64Image: string) => {
    setContingents(prev => prev.map(c => {
      if (c.contingentName === contingentName) {
        return {
          ...c,
          buktiTransferUrl: base64Image
        };
      }
      return c;
    }));
    if (currentUser && currentUser.contingentName === contingentName) {
      setCurrentUser(prev => prev ? { ...prev, buktiTransferUrl: base64Image } : null);
    }
    appendLog("UPLOAD BUKTI", `Kontingen ${contingentName} mengunggah bukti pembayaran`);
  };"""

new_logic = """  const handleUploadReceipt = (contingentName: string, base64Image: string) => {
    setContingents(prev => prev.map(c => {
      if (c.contingentName === contingentName) {
        return {
          ...c,
          buktiTransferUrl: base64Image
        };
      }
      return c;
    }));
    if (currentUser && currentUser.contingentName === contingentName) {
      setCurrentUser(prev => prev ? { ...prev, buktiTransferUrl: base64Image } : null);
    }
    appendLog("UPLOAD BUKTI", `Kontingen ${contingentName} mengunggah bukti pembayaran`);
    
    // WA Notification
    const adminNum = settings.adminWaNumber || "6282123456789";
    const waMessage = encodeURIComponent(`*UPLOAD BUKTI PEMBAYARAN*\\n\\nKontingen: ${contingentName}\\nTelah mengunggah bukti pembayaran di sistem.\\n\\nSilakan cek dan validasi pembayaran pada menu Admin.`);
    const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
    window.open(waUrl, "_blank");
  };"""

content = content.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fix WA receipt")

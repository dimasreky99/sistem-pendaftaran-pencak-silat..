export async function syncAllDataToSheets(accessToken: string, spreadsheetId: string, data: any) {
  // data: { athletes, logs, schedule, contingents, etc }
  
  // We can use batchUpdate to update multiple sheets at once, or just use values.update
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  
  // Helper to clear and write a sheet
  const writeSheet = async (sheetName: string, headers: string[], rows: any[][]) => {
    // 1. Ensure sheet exists (we might need to create it if it doesn't, but let's assume it exists or we just create if we catch 400)
    // Actually, values.update will fail if sheet doesn't exist.
    // Instead of creating sheets, it's better to just write and if it fails, add the sheet.
    
    // First, let's just write to it
    const body = {
      values: [headers, ...rows]
    };
    
    let res = await fetch(`${baseUrl}/values/${sheetName}!A1:Z1000?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    if (res.status === 400) {
      // Sheet probably doesn't exist, let's create it
      await fetch(`${baseUrl}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: { title: sheetName }
            }
          }]
        })
      });
      // Retry write
      res = await fetch(`${baseUrl}/values/${sheetName}!A1:Z1000?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
    }
  };

  // Sync Athletes
  const athleteHeaders = ["ID", "Nama", "Kontingen", "Kategori", "Kelas", "Jenis Kelamin", "Status ACC", "Status Timbang", "Tinggi (cm)", "Berat (kg)", "Tanggal Lahir"];
  const athleteRows = data.athletes.map((a: any) => [
    a.id, a.name, a.kontingen, a.kategori, a.kelas, a.jk, a.isAcc ? "ACC" : "Pending", a.statusTimbang || "-", a.tb || "-", a.bb || "-", a.tglLahir || "-"
  ]);
  await writeSheet("Peserta", athleteHeaders, athleteRows);
  
  // Sync Logs
  const logHeaders = ["Timestamp", "Aktor", "Aksi", "Kategori", "Detail"];
  const logRows = data.logs.map((l: any) => [
    new Date(l.timestamp).toLocaleString("id-ID"),
    l.actorName,
    l.action,
    l.category,
    l.details
  ]);
  await writeSheet("Security Logs", logHeaders, logRows);

  // Sync Contingents
  const contHeaders = ["ID", "Nama Kontingen", "PJ", "No WhatsApp", "Username"];
  const contRows = data.contingents.map((c: any) => [
    c.id, c.name, c.pjName, c.nowa, c.username
  ]);
  await writeSheet("Kontingen", contHeaders, contRows);

  return true;
}

export async function createNewSpreadsheet(accessToken: string, title: string): Promise<string> {
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: { title }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.spreadsheetId;
}

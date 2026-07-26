import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

handler = """  const handleToggleAcc = (athleteId: string) => {"""

new_handler = """  const handleImportExcelAthletes = (importedAthletes: Athlete[]) => {
    if (importedAthletes.length === 0) return;
    
    setAthletes(prev => {
      const merged = [...prev];
      for (const newAthlete of importedAthletes) {
        merged.push({
          ...newAthlete,
          id: Date.now().toString() + Math.floor(Math.random() * 1000000).toString()
        });
      }
      return merged;
    });
    
    // Also create missing contingents automatically
    const uniqueContingents = Array.from(new Set(importedAthletes.map(a => a.kontingen))).filter(Boolean);
    if (uniqueContingents.length > 0) {
      setContingents(prev => {
        const merged = [...prev];
        const existingNames = new Set(merged.map(c => c.contingentName.toLowerCase()));
        let added = 0;
        for (const cName of uniqueContingents) {
          if (!existingNames.has(cName.toLowerCase())) {
            merged.push({
              id: "A_" + Date.now() + Math.floor(Math.random() * 1000),
              pjName: "Imported PJ",
              nowa: "000",
              contingentName: cName,
              username: cName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random()*100),
              passwordHash: "123456",
              role: "kontingen",
              paymentStatus: "Lunas",
              buktiTransferUrl: "",
              kodeUnik: Math.floor(100 + Math.random() * 900)
            });
            added++;
          }
        }
        return added > 0 ? merged : prev;
      });
    }

    appendLog("IMPORT EXCEL", `Mengimpor ${importedAthletes.length} atlet dari file Excel.`);
    alert(`Berhasil mengimpor ${importedAthletes.length} atlet dari Excel.`);
  };

  const handleToggleAcc = (athleteId: string) => {"""

content = content.replace(handler, new_handler)

prop_old = """              onAddAthleteForContingent={(contingentName) => {
                setTargetContingentForAdd(contingentName);
                setSelectedAthlete(null);
                setIsEditingAthlete(true);
              }}"""
prop_new = """              onAddAthleteForContingent={(contingentName) => {
                setTargetContingentForAdd(contingentName);
                setSelectedAthlete(null);
                setIsEditingAthlete(true);
              }}
              onImportExcelAthletes={handleImportExcelAthletes}"""

content = content.replace(prop_old, prop_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)


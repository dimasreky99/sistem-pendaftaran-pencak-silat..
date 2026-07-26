import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'  const handleRejectAthlete = \(athleteId: string, notes: string\) => \{\s+setAthletes\(prev => prev\.map\(a => \{\s+if \(a\.id === athleteId\) \{\s+appendLog\("TOLAK ATLET", `Minta revisi atlet ID \$\{athleteId\}: \$\{notes\}`\);\s+return \{'
new_code = """  const handleRejectAthlete = (athleteId: string, notes: string) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        appendLog("TOLAK ATLET", `Minta revisi atlet ID ${athleteId}: ${notes}`);
        
        const tgtContingent = contingents.find(c => c.contingentName === a.kontingen);
        if (tgtContingent && tgtContingent.nowa) {
           const waMessage = `*REVISI BERKAS ATLET*\\n\\nHalo Kontingen ${a.kontingen},\\nAtlet atas nama *${a.name}* membutuhkan revisi.\\n\\nCatatan Admin:\\n${notes}\\n\\nMohon segera login dan perbaiki berkas atlet tersebut.`;
           sendAutoWhatsApp(waMessage, settings, tgtContingent.nowa);
        }
        
        return {"""
content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

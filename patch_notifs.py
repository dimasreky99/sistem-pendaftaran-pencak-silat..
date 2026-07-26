import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

toggle_acc_pattern = r'(  const handleToggleAcc = \(athleteId: string\) => \{\n    setAthletes\(prev => prev\.map\(a => \{\n      if \(a\.id === athleteId\) \{\n        const nextVal = !a\.isAcc;\n        appendLog\("ACC PESERTA", `\$\{nextVal \? "Menyetujui" : "Membatalkan"\} ACC Atlet ID: \$\{athleteId\}`\);)'
toggle_acc_repl = r'''\1
        
        const tgtContingent = contingents.find(c => c.contingentName === a.kontingen);
        if (tgtContingent && tgtContingent.nowa) {
          const statusText = nextVal ? "DITERIMA (ACC)" : "DIBATALKAN ACC";
          const waMessage = `*STATUS VALIDASI ATLET*\n\nHalo Kontingen ${a.kontingen},\nStatus berkas atlet atas nama *${a.name}* telah diubah menjadi: *${statusText}*.`;
          sendAutoWhatsApp(waMessage, settings, tgtContingent.nowa);
        }'''

content = re.sub(toggle_acc_pattern, toggle_acc_repl, content)

weigh_in_pattern = r'(        if \(a\.id === athleteId\) \{\n          appendLog\("TIMBANG", `Timbang berat \$\{weight\} kg \(\$\{status\}\) untuk atlet ID: \$\{athleteId\}`\);\n          return \{\n            \.\.\.a,\n            beratAktual: weight,\n            statusTimbang: status,\n            waktuTimbang: waktuTimbang \|\| new Date\(\)\.toLocaleString\("id-ID"\),\n            \.\.\.additionalData\n          \};\n        \}\n        return a;\n      \}\);\n\n      autoResolveAllBrackets\(updated\);\n      return updated;\n    \}\);\n  \};)'

weigh_in_repl = r'''        if (a.id === athleteId) {
          appendLog("TIMBANG", `Timbang berat ${weight} kg (${status}) untuk atlet ID: ${athleteId}`);
          
          const tgtContingent = contingents.find(c => c.contingentName === a.kontingen);
          if (tgtContingent && tgtContingent.nowa && (status === "OVER" || status === "UNDER")) {
            const waMessage = `*INFO TIMBANG BADAN ATLET*\n\nHalo Kontingen ${a.kontingen},\nAtlet atas nama *${a.name}* baru saja melakukan timbang badan.\n\nHasil Timbang: ${weight} kg\nStatus: *${status}*\n\nMohon segera melapor ke meja panitia/admin terkait status berat badan ini.`;
            sendAutoWhatsApp(waMessage, settings, tgtContingent.nowa);
          }
          
          return {
            ...a,
            beratAktual: weight,
            statusTimbang: status,
            waktuTimbang: waktuTimbang || new Date().toLocaleString("id-ID"),
            ...additionalData
          };
        }
        return a;
      });

      autoResolveAllBrackets(updated);
      return updated;
    });
  };'''

content = re.sub(weigh_in_pattern, weigh_in_repl, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_print = """          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {/* If printing bulk */}
            {bulkIdCardsTargets.length > 0 && (
              <div className="flex flex-wrap justify-start gap-8 bg-white p-0">
                {athletes
                  .filter(a => bulkIdCardsTargets.includes(a.kontingen) && a.isAcc)
                  .map(a => {"""

new_print = """          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {/* If printing bulk */}
            {bulkIdCardsTargets.length > 0 && (
              <div className="flex flex-wrap justify-start gap-8 bg-white p-0">
                {(() => {
                  let allTargets: any[] = [];
                  for (const t of bulkIdCardsTargets) {
                      const tgt = contingents.find(c => c.contingentName === t);
                      const officials = tgt ? [
                        { name: tgt.pjName || "Penanggung Jawab", kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `mgr-${tgt.id}`, isOfficial: true, officialRole: "MANAGER", photoUrl: tgt.managerPhotoUrl },
                        ...(tgt.official1Name || tgt.official1PhotoUrl ? [{ name: tgt.official1Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off1-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official1PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off1-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL" }]),
                        ...(tgt.official2Name || tgt.official2PhotoUrl ? [{ name: tgt.official2Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off2-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official2PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: `off2-${tgt.id}`, isOfficial: true, officialRole: "OFFICIAL" }])
                      ] : [];
                      allTargets = [...allTargets, ...officials, ...athletes.filter(a => a.kontingen === t && a.isAcc)];
                  }
                  return allTargets;
                })().map(a => {"""

content = content.replace(old_print, new_print)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/dummy.ts', 'r') as f:
    content = f.read()

old_func = """      if (cls.pa) {
        for (let i = 0; i < targetCount; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} (${targetCount})`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putra",
            kategori: catName,
            kelas: cls.name,
            kontingen: `Konti-${getRandomElement(lastNames)}`,
            nowa: "08123456789",
            customData: settings.customFields.map(() => "Dummy"),
            fotos: settings.photoLabels.map(() => ""),
            isAcc: true,
            statusTimbang: "",
            beratAktual: 0
          };
          batch.set(newDocRef, athlete);
          opCount++;
          totalGenerated++;
        }
        
        if (!isTeam) {
            targetCount++;
            if (targetCount > 50) targetCount = 2;
        }
      }

      if (cls.pi) {
        for (let i = 0; i < targetCount; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} (${targetCount})`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putri",
            kategori: catName,
            kelas: cls.name,
            kontingen: `Konti-${getRandomElement(lastNames)}`,
            nowa: "08123456789",
            customData: settings.customFields.map(() => "Dummy"),
            fotos: settings.photoLabels.map(() => ""),
            isAcc: true,
            statusTimbang: "",
            beratAktual: 0
          };
          batch.set(newDocRef, athlete);
          opCount++;
          totalGenerated++;
        }
        
        if (!isTeam) {
            targetCount++;
            if (targetCount > 50) targetCount = 2;
        }
      }"""

new_func = """      if (cls.pa && !isTeam) {
        const count = targetCount;
        for (let i = 0; i < count; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} (${count})`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putra",
            kategori: catName,
            kelas: cls.name,
            kontingen: `Konti-${getRandomElement(lastNames)}`,
            nowa: "08123456789",
            customData: settings.customFields.map(() => "Dummy"),
            fotos: settings.photoLabels.map(() => ""),
            isAcc: true,
            statusTimbang: "",
            beratAktual: 0
          };
          batch.set(newDocRef, athlete);
          opCount++;
          totalGenerated++;
        }
        targetCount++;
        if (targetCount > 50) targetCount = 2;
      }

      if (cls.pi && !isTeam) {
        const count = targetCount;
        for (let i = 0; i < count; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)} (${count})`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putri",
            kategori: catName,
            kelas: cls.name,
            kontingen: `Konti-${getRandomElement(lastNames)}`,
            nowa: "08123456789",
            customData: settings.customFields.map(() => "Dummy"),
            fotos: settings.photoLabels.map(() => ""),
            isAcc: true,
            statusTimbang: "",
            beratAktual: 0
          };
          batch.set(newDocRef, athlete);
          opCount++;
          totalGenerated++;
        }
        targetCount++;
        if (targetCount > 50) targetCount = 2;
      }"""

content = content.replace(old_func, new_func)

with open('src/dummy.ts', 'w') as f:
    f.write(content)


import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { SystemSettings, Athlete } from "./types";

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const firstNames = ["Budi", "Andi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Intan", "Joko", "Kartika", "Lestari", "Mawan", "Nita", "Okan", "Putri", "Qori", "Rudi", "Sari", "Tono", "Umar", "Vina", "Wati", "Yudi", "Zainal"];
const lastNames = ["Santoso", "Wijaya", "Kusuma", "Pratama", "Sari", "Putra", "Hidayat", "Setiawan", "Nugroho", "Gunawan"];

export async function generateDummyAthletes(settings: SystemSettings, countPerClass: number = 10) {
  const athletesRef = collection(db, "athletes");
  let totalGenerated = 0;
  
  let batch = writeBatch(db);
  let opCount = 0;
  let batches = [batch];

  for (const catName of Object.keys(settings.classData)) {
    const cat = settings.classData[catName];
    if (!cat.active || cat.isBebas) continue;

    for (const cls of cat.classes) {
      if (!cls.active) continue;

      if (cls.pa) {
        for (let i = 0; i < countPerClass; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putra",
            kategori: catName,
            kelas: cls.name,
            kontingen: "Cabang Ponorogo",
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
      }

      if (cls.pi) {
        for (let i = 0; i < countPerClass; i++) {
          if (opCount === 490) {
            batch = writeBatch(db);
            batches.push(batch);
            opCount = 0;
          }
          const newDocRef = doc(athletesRef);
          const athlete: Athlete = {
            id: newDocRef.id,
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            tglLahir: "2010-01-01",
            jk: "Putri",
            kategori: catName,
            kelas: cls.name,
            kontingen: "Cabang Ponorogo",
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
      }
    }
  }

  for (const b of batches) {
    await b.commit();
  }
  return totalGenerated;
}

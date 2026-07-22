import { db } from "./firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { Athlete, SystemSettings } from "./types";

export const generateDummyAthletes = async (settings: SystemSettings, contingentsCount: number = 5) => {
  const batch = writeBatch(db);
  let idCounter = Date.now();
  
  // Dummy contingents if they don't exist
  // We'll just generate random contingent names for the athletes
  const dummyContingents = Array.from({length: contingentsCount}, (_, i) => `Dummy Kontingen ${i+1}`);

  let opCount = 0;
  for (const [catName, catData] of Object.entries(settings.classData)) {
    if (!catData.active || catData.isBebas) continue;
    
    for (const c of catData.classes) {
      if (!c.active) continue;
      
      // Determine number of athletes (2 to 50)
      const numAthletes = Math.floor(Math.random() * 49) + 2; 

      for (let i = 0; i < numAthletes; i++) {
        const isPa = c.pa && c.pi ? (Math.random() > 0.5) : c.pa;
        
        const ath: Athlete = {
          id: `DUMMY_${idCounter++}`,
          name: `Atlet Dummy ${catName} ${c.name} - ${i+1}`,
          nik: `DUMMYNIK${idCounter}`,
          tglLahir: "2010-01-01",
          jk: isPa ? "Putra" : "Putri",
          kategori: catName,
          kelas: c.name,
          kontingen: dummyContingents[i % dummyContingents.length],
          nowa: "081234567890",
          customData: [],
          fotos: [],
          isAcc: true,
          statusTimbang: "PAS",
          beratAktual: 0
        };
        batch.set(doc(db, "athletes", ath.id), ath);
        opCount++;

        // Firestore batch limit is 500
        if (opCount >= 450) {
          await batch.commit();
          opCount = 0;
        }
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
};

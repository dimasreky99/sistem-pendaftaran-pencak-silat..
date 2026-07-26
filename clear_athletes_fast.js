import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, limit, query } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clearAthletes() {
  console.log("Clearing athletes in batches...");
  const athletesRef = collection(db, "athletes");
  let totalDeleted = 0;
  
  while (true) {
    const q = query(athletesRef, limit(500));
    const snapshot = await getDocs(q);
    if (snapshot.size === 0) {
      break;
    }
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    totalDeleted += snapshot.size;
    console.log(`Deleted ${totalDeleted} athletes so far...`);
  }
  console.log(`Finished. Deleted ${totalDeleted} athletes in total.`);
}

clearAthletes().then(() => process.exit(0)).catch(console.error);

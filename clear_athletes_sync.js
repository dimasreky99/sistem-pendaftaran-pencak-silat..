const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clearAthletes() {
  console.log("Clearing athletes...");
  const athletesRef = collection(db, "athletes");
  const snapshot = await getDocs(athletesRef);
  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
    count++;
  }
  console.log(`Deleted ${count} athletes.`);
}

clearAthletes().then(() => process.exit(0)).catch(console.error);

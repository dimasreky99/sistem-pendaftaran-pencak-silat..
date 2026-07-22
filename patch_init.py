import re

with open('src/useFirebaseState.ts', 'r') as f:
    content = f.read()

old_effect = """  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
      const items = snapshot.docs.map(docSnap => docSnap.data() as T);
      setData(items);
      setIsLoaded(true);
    }, (error) => {"""

new_effect = """  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
      if (snapshot.empty && initialData.length > 0) {
        // Init if completely empty
        const batch = writeBatch(db);
        initialData.forEach(item => {
          batch.set(doc(db, collectionName, String(item.id)), item);
        });
        batch.commit().catch(e => console.error("Error init:", e));
        setData(initialData);
      } else {
        const items = snapshot.docs.map(docSnap => docSnap.data() as T);
        setData(items);
      }
      setIsLoaded(true);
    }, (error) => {"""

content = content.replace(old_effect, new_effect)

with open('src/useFirebaseState.ts', 'w') as f:
    f.write(content)

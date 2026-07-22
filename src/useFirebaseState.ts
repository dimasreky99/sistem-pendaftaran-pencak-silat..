import { useState, useEffect } from "react";
import { collection, onSnapshot, setDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export function useFirebaseCollection<T extends { id: string }>(collectionName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    }, (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      setIsLoaded(true); // Don't block UI forever
    });
    return unsub;
  }, [collectionName]);

  const setCollection = (action: any) => {
    setData((prev) => {
      const newData = typeof action === 'function' ? (action as any)(prev) : action;
      syncToFirebase(prev, newData);
      return newData;
    });
  };

  const syncToFirebase = async (oldData: T[], newData: T[]) => {
    try {
      const batch = writeBatch(db);
      let opCount = 0;

      // 1. Find deleted items
      const newIds = new Set(newData.map(item => item.id));
      for (const oldItem of oldData) {
        if (!newIds.has(oldItem.id)) {
          batch.delete(doc(db, collectionName, String(oldItem.id)));
          opCount++;
        }
      }

      // 2. Find added/modified items
      const oldMap = new Map(oldData.map(item => [item.id, item]));
      for (const newItem of newData) {
        if (!newItem.id) continue;
        const oldItem = oldMap.get(newItem.id);
        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          batch.set(doc(db, collectionName, String(newItem.id)), newItem);
          opCount++;
        }
      }

      if (opCount > 0) {
        // Note: Firestore batch has a limit of 500 operations.
        // For a simple app, we assume updates are small.
        // If it's a massive reset, it might exceed 500, but we can catch and ignore for now.
        if (opCount <= 500) {
           await batch.commit();
        } else {
           console.warn("Too many operations for a single batch. Doing sequential sets.");
           for (const newItem of newData) {
             await setDoc(doc(db, collectionName, String(newItem.id)), newItem);
           }
        }
      }
    } catch (e) {
      console.error("Firebase sync error:", e);
    }
  };

  return [data, setCollection, isLoaded] as const;
}

export function useFirebaseDoc<T>(docPath: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, docPath), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as T);
      } else {
        // Init if not exists
        setDoc(doc(db, docPath), initialData);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error(`Error listening to ${docPath}:`, error);
      setIsLoaded(true);
    });
    return unsub;
  }, [docPath]);

  const setDocument = (action: any) => {
    setData((prev) => {
       const newData = typeof action === 'function' ? (action as any)(prev) : action;
       if (JSON.stringify(prev) !== JSON.stringify(newData)) {
         setDoc(doc(db, docPath), newData).catch(e => console.error(e));
       }
       return newData;
    });
  }
  return [data, setDocument, isLoaded] as const;
}

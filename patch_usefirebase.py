import re

with open('src/useFirebaseState.ts', 'r') as f:
    content = f.read()

old_sync = """        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          batch.set(doc(db, collectionName, String(newItem.id)), newItem);
          opCount++;
        }"""

new_sync = """        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          // Firebase doesn't support undefined values, so we strip them
          // using JSON parse/stringify which naturally drops undefined keys.
          const cleanItem = JSON.parse(JSON.stringify(newItem));
          batch.set(doc(db, collectionName, String(newItem.id)), cleanItem);
          opCount++;
        }"""

content = content.replace(old_sync, new_sync)

old_too_many = """           for (const newItem of newData) {
             await setDoc(doc(db, collectionName, String(newItem.id)), newItem);
           }"""

new_too_many = """           for (const newItem of newData) {
             const cleanItem = JSON.parse(JSON.stringify(newItem));
             await setDoc(doc(db, collectionName, String(newItem.id)), cleanItem);
           }"""

content = content.replace(old_too_many, new_too_many)

old_doc_set = """       if (JSON.stringify(prev) !== JSON.stringify(newData)) {
         setDoc(doc(db, docPath), newData).catch(e => console.error(e));
       }"""

new_doc_set = """       if (JSON.stringify(prev) !== JSON.stringify(newData)) {
         const cleanData = JSON.parse(JSON.stringify(newData));
         setDoc(doc(db, docPath), cleanData).catch(e => console.error(e));
       }"""
       
content = content.replace(old_doc_set, new_doc_set)


with open('src/useFirebaseState.ts', 'w') as f:
    f.write(content)

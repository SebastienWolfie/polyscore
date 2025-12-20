import { doc, collection, updateDoc, setDoc, getDoc, getDocs, query, where, and } from 'firebase/firestore';
import { db } from '../firebase';
import Date from '../utils/Date'

async function getUser(id) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, 'airdropshqlist', id)
        const querySnapshot = await getDoc(docRef);
  
        resolve(querySnapshot.data());
    })
}


async function update(id, item) {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = doc(db, 'airdropshqlist', id);
            const result = await updateDoc(docRef, item)
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
  }


async function updateFeatued(id) {
  try {
    const colRef = collection(db, "airdropshqlist");
    const snapshot = await getDocs(colRef);


    if (snapshot.empty) {
      console.log("No documents found in airdropshqlist");
      return;
    }

    for (const document of snapshot.docs) {
      const data = document.data();

      const documentId = data.id;
      if (!documentId) {
        console.log("No airdrop id field for", document.id);
        continue;
      }

      await updateDoc(doc(db, "airdropshqlist", document.id), {
        isFeatured: (documentId==id),
      });

    }

  } catch (error) {
    console.error("Migration error:", error);
  }
}



async function create(id, item) {
    return new Promise(async(resolve, reject) => {
        try {
             const collectionRef = collection(db, 'airdropshqlist');
             const docRef = doc(collectionRef, id)
             item.id = id;
             item.dateCreated= new Date().toJSON();
 
             await setDoc(docRef, item)
             resolve(item);
         } catch (error) {
             reject(error)
         }
    })
}


async function getAll() {
    return new Promise(async (resolve, reject) => {
        const collectionRef = collection(db, 'airdropshqlist');
        const querySnapshot = await getDocs(collectionRef);
  
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        })
        resolve(list);
    })
}


export { getUser,
         update,
         create,
         getAll,
         updateFeatued
        }
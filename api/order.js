import { doc, collection, updateDoc, setDoc, getDoc, getDocs, query, where, and } from 'firebase/firestore';
import { db } from '../firebase';
import Date from '../utils/Date'

async function getUser(id) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, 'unibridge_orders', id)
        const querySnapshot = await getDoc(docRef);
  
        resolve(querySnapshot.data());
    })
}


async function update(id, item) {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = doc(db, 'unibridge_orders', id);
            const result = await updateDoc(docRef, item)
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
  }




async function create(item) {
    return new Promise(async(resolve, reject) => {
        try {
             const collectionRef = collection(db, 'unibridge_orders');
             const docRef = doc(collectionRef)
             const id = docRef.id;
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
        const collectionRef = collection(db, 'unibridge_orders');
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
         getAll
        }
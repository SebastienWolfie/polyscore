import { doc, collection, updateDoc, setDoc, getDoc, getDocs, query, where, and } from 'firebase/firestore';
import { db } from '../firebase';
import Date from '../utils/Date'



async function getAll() {
    return new Promise(async (resolve, reject) => {
        const collectionRef = collection(db, 'admin_polyscore_addresses');
        const querySnapshot = await getDocs(collectionRef);
  
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        })
        resolve(list);
    })
}


export {
         getAll
        }
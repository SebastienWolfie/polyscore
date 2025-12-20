import Date from '../../utils/Date';
import { doc, collection, updateDoc, arrayUnion, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';


async function getAddressSignature(address) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, 'signatures', address)
        const querySnapshot = await getDoc(docRef);
  
        resolve(querySnapshot.data());
    })
}


async function create(address) {
    return new Promise(async(resolve, reject) => {
        try {
             const docRef = doc(db, 'signatures', address);
             const item = {
                address: address,
                signatures: [],
                dateCreated: new Date().toJSON()
             }

             await setDoc(docRef, item)
             resolve(item);
         } catch (error) {
             reject(error)
         }
    })
}




async function update(address, item) {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = doc(db, 'signatures', address);
            await updateDoc(docRef, {
                signatures: arrayUnion(item)
            });
            resolve()
        } catch (error) {
            reject(error)
        }
    })
  }



  export { getAddressSignature, create, update }
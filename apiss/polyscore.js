import Date from '../utils/Date';
import { doc, collection, updateDoc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../firebase';

async function getAll() {
    return new Promise(async (resolve, reject) => {
        const collectionRef = collection(db, 'polyscore');
        const querySnapshot = await getDocs(collectionRef);
  
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        })
        resolve(list);
    })
}


async function getPolyscore(address) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, 'polyscore', address)
        const querySnapshot = await getDoc(docRef);
  
        resolve(querySnapshot.data());
    })
}


async function create(address, item) {
    const res = await getPolyscore(address)
    console.log('response', res)
    if (res) {
        return update(address, item)
    }
    return new Promise(async(resolve, reject) => {
        try {
             const docRef = doc(db, 'polyscore', address)
             item.address = address;
             item.dateCreated= new Date().toJSON();

             setDoc(docRef, item)
                 .then(result => {
                     resolve(item);
                 })
                 .catch(reject)
         } catch (error) {
             reject(error)
         }
    })
}

async function update(address, item) {
    return new Promise((resolve, reject) => {
        try {
            const docRef = doc(db, 'polyscore', address);

            updateDoc(docRef, item)
                .then(result => {
                    resolve(item);
                })
                .catch(reject)
        } catch (error) {
            reject(error)
        }
    })
}





  async function deletePolyscore(id) {
    return new Promise((resolve, reject) => {
        const docRef = doc(db, 'polyscore', id)
        deleteDoc(docRef).then(resolve).catch(reject)
    })
  }


export { getAll, getPolyscore, create, update, deletePolyscore }
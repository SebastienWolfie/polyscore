import { doc, collection, updateDoc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Date from '../utils/Date';

async function getAll() {
    return new Promise(async (resolve, reject) => {
        try {
            const collectionRef = collection(db, 'polyscore');
            const querySnapshot = await getDocs(collectionRef);
      
            let list = [];
            querySnapshot.forEach((doc) => {
              // We include id from doc.id just in case the data doesn't have it
              list.push({ id: doc.id, ...doc.data() });
            })
            resolve(list);
        } catch (error) {
            reject(error);
        }
    })
}

async function getPolyscore(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = doc(db, 'polyscore', address);
            const querySnapshot = await getDoc(docRef);
            resolve(querySnapshot.data());
        } catch (error) {
            reject(error);
        }
    })
}

async function create(address, item) {
    // Check if exists to determine update vs create
    const res = await getPolyscore(address);
    if (res) {
        return update(address, item);
    }
    
    return new Promise(async(resolve, reject) => {
        try {
             const docRef = doc(db, 'polyscore', address);
             item.address = address;
             item.id = address; // Ensure ID is consistent
             item.dateCreated = new Date().toJSON();

             setDoc(docRef, item)
                 .then(result => {
                     resolve(item);
                 })
                 .catch(reject);
         } catch (error) {
             reject(error);
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
                .catch(reject);
        } catch (error) {
            reject(error);
        }
    })
}

async function deleteScore(id) {
    return new Promise((resolve, reject) => {
        try {
            const docRef = doc(db, 'polyscore', id);
            deleteDoc(docRef).then(resolve).catch(reject);
        } catch (error) {
            reject(error);
        }
    })
}

export { 
    getAll, 
    getPolyscore, 
    create, 
    update, 
    deleteScore 
}
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";

import { doc, collection, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { app } from "../firebase";
import { getUserWithEmail } from "./user";
import Date from '../utils/Date'


async function googleLogin() {
    return new Promise((resolve, reject) => {
        const auth = getAuth(app);
        const googleProvider = new GoogleAuthProvider();
        signInWithPopup(auth, googleProvider)
            .then(async(result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
                
                const doesUserExists = await getUserWithEmail(user.email)
                if (doesUserExists) {
                    const docRef = doc(db, 'score_users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        useAuth().value.user = docSnap.data();
                        resolve(docSnap.data());
                    }else {
                        reject("No such document")
                    }
                }else{
                    const docRef = doc(db, 'score_users', user.uid);
                    const id = user?.uid;
                    const data = {
                        id: id,
                        email: user.email,
                        username: user.displayName,
                        authenticator: 'google',
                        emailVerified: false,
                        dateCreated: new Date().toJSON()
                    }
                    
                    await setDoc(docRef, data)
                    useAuth().value.user = data;
                    resolve(data);
                }
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
                reject(error);
            });
    });
}

async function login(email, password) {
    return new Promise((resolve, reject) => {
        const auth = getAuth(app);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredentials) => {
                const user = userCredentials.user;
                return user;
            })
            .then(async function(user){
                const docRef = doc(db, 'score_users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    useAuth().value.user = docSnap.data();
                    resolve(docSnap.data());
                }else {
                    reject("No such document")
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}


async function register(username, usermail, password, walletAddress, polyAddress) {
    return new Promise((resolve, reject) => {
        const auth = getAuth(app);
        createUserWithEmailAndPassword(auth, usermail, password)
            .then((userCredentials) => {
                const user = userCredentials.user;
                return user;
            })
            .then(async function(user){
                const docRef = doc(db, 'score_users', user?.uid);
                const id = user?.uid;
                const data = {
                    id: id,
                    username: username,
                    email: usermail,
                    password: password,
                    walletAddress,
                    polyAddress,
                    emailVerified: false,
                    dateCreated: new Date().toJSON()
                }
                
                setDoc(docRef, data)
                    .then(result => {
                        useAuth().value.user = data;
                        resolve(data);
                    })
                    .catch(reject);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


export {
    login, register,
    googleLogin
};
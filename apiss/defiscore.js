import {
  doc,
  collection,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore'

import { db } from '../firebase'
import Date from '../utils/Date'

/**
 * Normalize wallet address so Firestore is case-insensitive
 */
function normalizeAddress(address) {
  if (!address) return address
  return address.toLowerCase().trim()
}

/**
 * Get all DeFi scores
 */
async function getAll() {
  return new Promise(async (resolve, reject) => {
    try {
      const collectionRef = collection(db, 'defiscore')
      const querySnapshot = await getDocs(collectionRef)

      const list = []
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })

      resolve(list)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get DeFi score by wallet (case-insensitive)
 */
async function getDefiscore(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'defiscore', normalized)
      const snapshot = await getDoc(docRef)

      resolve(snapshot.exists() ? snapshot.data() : null)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Create DeFi score (or update if exists)
 */
async function create(address, item) {
  const normalized = normalizeAddress(address)

  const existing = await getDefiscore(normalized)
  if (existing) {
    return update(normalized, item)
  }

  return new Promise(async (resolve, reject) => {
    try {
      const docRef = doc(db, 'defiscore', normalized)

      const payload = {
        ...item,
        id: normalized,
        address: normalized,          // canonical
        originalAddress: address,     // optional (display/debug)
        dateCreated: new Date().toJSON()
      }

      await setDoc(docRef, payload)
      resolve(payload)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Update DeFi score (case-insensitive)
 */
async function update(address, item) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'defiscore', normalized)

      await updateDoc(docRef, item)
      resolve(item)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Delete DeFi score by wallet (case-insensitive)
 */
async function deleteScore(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'defiscore', normalized)

      await deleteDoc(docRef)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

export {
  getAll,
  getDefiscore,
  create,
  update,
  deleteScore
}

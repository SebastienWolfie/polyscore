import Date from '../../utils/Date'
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc
} from 'firebase/firestore'

import { db } from '../../firebase'

/**
 * Normalize wallet address (case-insensitive Firestore IDs)
 */
function normalizeAddress(address) {
  if (!address) return address
  return address.toLowerCase().trim()
}

/**
 * Get signatures for an address
 */
async function getAddressSignature(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'signatures', normalized)
      const snapshot = await getDoc(docRef)

      resolve(snapshot.exists() ? snapshot.data() : null)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Create signature document (if not exists)
 */
async function create(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'signatures', normalized)

      const item = {
        id: normalized,
        address: normalized,          // canonical
        originalAddress: address,     // optional (display/debug)
        signatures: [],
        dateCreated: new Date().toJSON()
      }

      await setDoc(docRef, item)
      resolve(item)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Add a signature to address (arrayUnion-safe)
 */
async function update(address, signature) {
  return new Promise(async (resolve, reject) => {
    try {
      const normalized = normalizeAddress(address)
      const docRef = doc(db, 'signatures', normalized)

      await updateDoc(docRef, {
        signatures: arrayUnion(signature)
      })

      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

export {
  getAddressSignature,
  create,
  update
}

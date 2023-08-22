import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { get, getDatabase, ref, set } from 'firebase/database'
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

let app, db, functions, auth, firestore;

export function initializeFirebase(firebaseConfig) {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  functions = getFunctions(app)
  auth = getAuth()
  firestore = getFirestore()
}

export {
  addDoc,
  app,
  auth,
  collection,
  collectionGroup,
  db,
  doc,
  firestore,
  functions,
  get,
  getDoc,
  getDocs,
  onAuthStateChanged,
  orderBy,
  query,
  ref,
  set,
  signInWithEmailAndPassword,
  where,
}
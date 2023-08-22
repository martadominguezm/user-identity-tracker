const { initializeApp } = require('firebase/app')
const { getAuth, onAuthStateChanged, signInWithEmailAndPassword } = require('firebase/auth')
const { get, getDatabase, ref, set } = require('firebase/database')
const {
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
} = require('firebase/firestore')
const { getFunctions } = require('firebase/functions')

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
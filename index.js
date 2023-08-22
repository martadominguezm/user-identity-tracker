// index.js
const {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl,
    initializeFirebase,
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
    where
} = require('./lib/_helpers');

function initialize(firebaseConfig) {
    initializeFirebase(firebaseConfig);
}

module.exports = {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl,
    initialize,
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
    where
};
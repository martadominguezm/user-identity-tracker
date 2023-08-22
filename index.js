// index.js
const {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl
} = require('./lib/_helpers');


let    addDoc;
let    app;
let    auth;
let    collection;
let    collectionGroup;
let    db;
let    doc;
let    firestore;
let    functions;
let    get;
let    getDoc;
let    getDocs;
let    onAuthStateChanged;
let    orderBy;
let    query;
let    ref;
let    set;
let    signInWithEmailAndPassword;
let     where;


function importFbFunctions(
    addDoc=addDoc,
    app=app,
    auth=auth,
    collection=collection,
    collectionGroup=collectionGroup,
    db=db,
    doc=doc,
    firestore=firestore,
    functions=functions,
    get=get,
    getDoc=getDoc,
    getDocs=getDocs,
    onAuthStateChanged=onAuthStateChanged,
    orderBy=orderBy,
    query=query,
    ref=ref,
    set=set,
    signInWithEmailAndPassword=signInWithEmailAndPassword,
    where=where) {

}




module.exports = {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl,
    importFbFunctions,
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
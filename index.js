// index.js
const {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl,
    initializeFirebase
} = require('./lib/_helpers');

function initialize(firebaseConfig) {
    initializeFirebase(firebaseConfig);
}

module.exports = {
    getSessions,
    calculateProbabilities,
    improveUserExperience,
    accessControl,
    initialize 
};
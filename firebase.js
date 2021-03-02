const firebase = require("firebase/app");
const firebaseDB = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyBd-OJc_zzObk7QxAEKvv4Rqx2TZKFoRzU",
  authDomain: "tax-collector-bot.firebaseapp.com",
  databaseURL: "https://tax-collector-bot-default-rtdb.firebaseio.com",
  projectId: "tax-collector-bot",
  storageBucket: "tax-collector-bot.appspot.com",
  messagingSenderId: "474463348738",
  appId: "1:474463348738:web:195be208bb15c36b60df1b",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let addAFK = (guild, name, date, period) => {
  if (guild && name && date && period) {
    let newPostKey = firebase.database().ref().child(guild).push().key;
    let data = {
      afkName: name,
      afkDate: date,
      afkPeriod: period,
    };
    firebase.database().ref(`${guild}/${newPostKey}`).update(data);
  }
};

module.exports = {
  addAfk: addAFK,
  database: firebase.database(),
};

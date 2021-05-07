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
    let data = {
      afkName: name,
      afkDate: date,
      afkPeriod: period,
    };
    firebase.database().ref(`afk/${guild}/${name}`).update(data);
  }
};

let pullData = async (path) => {
  let response = await firebase.database().ref(`${path}/`).once("value");

  if (response.code) {
    throw new Error(response.code);
  } else {
    const data = [];
    response.forEach((v) => {
      data.push(v.val());
    });
    return data;
  }
};

let cleanupDates = (guildid) => {
  pullData(`afk/${guildid}`).then((data) => {
    data.forEach((e) => {
      if (Date.now() > Date.parse(e.afkDate)) {
        firebase.database().ref(`afk/${guildid}/${e.afkName}`).remove();
      }
    });
  });
};

module.exports = {
  addAfk: addAFK,
  pullData: pullData,
  cleanupDates: cleanupDates,
  database: firebase.database,
};

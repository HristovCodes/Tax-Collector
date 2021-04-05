const fetch = require("node-fetch");
const stream = require("stream");
const Discord = require("discord.js");
const firebase = require("../firebase.js");

function calculateDate(weeks) {
  let result = new Date();
  result.setDate(result.getDate() + weeks * 7);
  return result.toLocaleDateString();
}

module.exports = {
  name: "split",
  args: false,
  usage: "",
  cooldown: 15,
  permissions: "",
  description: "League time?",
  execute(message, args) {
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (
      message.guild.id !== "757911675352645644" &&
      message.guild.id !== "700374713549193287" &&
      message.guild.id !== "809702779064811550" &&
      message.channel.id !== "805423509174091778"
    ) {
      return message.channel.send(
        `You cannot use \$${this.name} here or you are lacking the permission to do so. ${message.author}`
      );
    }
    let members = message.guild.member(message.author).voice.channel.members;
    let filteredMembers = members.array().map((element) => {
      return element.bot ? null : element.username;
    });

    let split = splitTeam(filteredMembers);

    message.channel.send(
      `Team1:\n${split.team1.join(", ")}\nTeam2:\n${split.team2.join(", ")}`
    );
  },
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function splitTeam(members) {
  let team1 = [];
  let team2 = [];
  members.forEach((x) => {
    const randN = getRandomInt(2);
    if (randN === 0 && team1.length < 5) {
      team1.push(x);
    } else if (randN === 1 && team2.length < 5) {
      team2.push(x);
    } else {
      if (team1.length === 5) {
        team2.push(x);
      } else if (team2.length === 5) {
        team1.push(x);
      }
    }
  });
  return { team1: team1, team2: team2 };
}

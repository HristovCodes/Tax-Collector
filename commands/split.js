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
  args: true,
  usage: "<channel>",
  cooldown: 2,
  permissions: "",
  description: "League time?",
  execute(message, args) {
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (
      message.guild.id !== "757911675352645644" &&
      message.channel.id !== "805423509174091778"
    ) {
      return message.channel.send(
        `You cannot use \$${this.name} here or you are lacking the permission to do so. ${message.author}`
      );
    }
    if (!args[0]) {
      return message.channel.send(
        `Mention the channel id you'd like to use as a reference.\n${message.author}`
      );
    }
    let members = member.voice.channel.member;
    let filteredMembers = members.array.map((element) => {
      return element.bot ? null : element.username;
    });

    let team1 = [];
    let team2 = [];

    filteredMembers.array.forEach((element) => {
      if (getRandomInt(2) === 0) {
        if (team1.length === 5) team2.push(element);
        else team1.push(element);
      } else {
        if (team2.length === 5) team1.push(element);
        team2.push(element);
      }
    });
    message.channel.send(
      `Team1:\n${team1.join(", ")}\nTeam2:\n${team2.join(", ")}`
    );
  },
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

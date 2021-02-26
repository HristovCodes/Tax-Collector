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
  name: "afk",
  args: true,
  usage: "<user> <duration> <reason>",
  cooldown: 2,
  permissions: "",
  description: "Going on vacation?",
  execute(message, args) {
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (
      message.channel.id !== "804718851903848448" &&
      message.channel.id !== "805423509174091778"
    ) {
      return message.channel.send(
        `You cannot use \$${this.name} here or you are lacking the permission to do so. ${message.author}`
      );
    }
    if (!args[0]) {
      return message.channel.send(
        `Ping the user you'd like to add to the list.\n${message.author}`
      );
    }
    if (!args[1] || isNaN(args[1])) {
      return message.channel.send(
        `Please provide a duration. The number you provide indicates how many weeks you will be offline.\nIf you will be offline for less than a week just type 1.\n${message.author}`
      );
    } else if (!args[2]) {
      return message.channel.send(
        `Please provide a reason for your inactivity.\n${message.author}`
      );
    }

    message.channel.messages.fetchPinned().then((pinned) => {
      let botMessage = pinned.find((m) =>
        m.content.includes("Inactive people:")
      );
      if (botMessage) {
        let content = botMessage.content;
        if (content.includes(args[0])) message.delete();
        else {
          botMessage.edit(
            content +
              `\n${args[0]} ${args[1]} weeks | ${calculateDate(args[1])}`
          );
          firebase.addAfk(message.guild.id, args[0], calculateDate(args[1]));
        }
      } else {
        message.channel
          .send(
            `Inactive people:\n${args[0]} ${args[1]} weeks | ${calculateDate(
              args[1]
            )}`
          )
          .then((m) => {
            m.pin();
            firebase.addAfk(message.guild.id, args[0], calculateDate(args[1]));
          });
      }
    });
  },
};

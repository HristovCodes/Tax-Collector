const fetch = require("node-fetch");
const stream = require("stream");
const Discord = require("discord.js");
const firebase = require("../firebase.js");

function calculateDate(weeks) {
  let result = new Date();
  result.setDate(result.getDate() + weeks * 7);
  return result.toDateString();
}

module.exports = {
  calculateDate: calculateDate,
  name: "afk",
  args: true,
  usage: "<user> <duration> <reason>",
  cooldown: 5,
  permissions: "",
  description: "Going on vacation?",
  execute(message, args) {
    firebase.cleanupDates(message.guild.id);
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (!message.member.hasPermission("MENTION_EVERYONE")) {
      return message.channel.send(
        `You cannot use \$${this.name} here because you are lacking the permission to do so. ${message.author}`
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

    firebase.pullData(`afk/${message.guild.id}`).then((res) => {
      if (res) {
        let data = res.map(
          (e) => `<@!${e.afkName}> for ${e.afkPeriod} weeks | ${e.afkDate}`
        );
        if (data.join("").includes(args[0])) message.delete();
        else {
          message.channel.messages.fetchPinned().then((pinned) => {
            let id = Array.from(args[0])
              .filter((e) => !isNaN(e))
              .join("");

            let botMessage = pinned.find((m) =>
              m.content.includes("Inactive people:")
            );

            if (botMessage) {
              // if the user is not in the pinned message add him to the database and to the pinned message
              firebase.addAfk(
                message.guild.id,
                id,
                calculateDate(args[1]),
                args[1]
              );

              botMessage.edit(
                `Inactive people:\n${args[0]} for ${
                  args[1]
                } weeks | ${calculateDate(args[1])}\n${data.join("\n")}`
              );
            } else {
              // if theres no message add the user to the database and make a message and pin it
              firebase.addAfk(
                message.guild.id,
                id,
                calculateDate(args[1]),
                args[1]
              );
              message.channel
                .send(
                  `Inactive people:\n${args[0]} for ${
                    args[1]
                  } weeks | ${calculateDate(args[1])}\n${data.join("\n")}`
                )
                .then((m) => {
                  m.pin();
                });
            }
          });
        }
      }
    });
  },
};

const fs = require("fs");
const Discord = require("discord.js");

const helpDescriptions = JSON.parse(
  fs.readFileSync("./helpDescriptions.json", "utf-8")
);

module.exports = {
  name: "help",
  args: false,
  usage: "<command>",
  cooldown: 15,
  permissions: "",
  description: "You lost bro?",
  execute(message, args) {
    if (!args[0]) {
      let embed = new Discord.MessageEmbed()
        .setColor("#009911")
        .setTitle("👽 Help 👽")
        .setFooter("Thanks for using the bot <3")
        .setTimestamp();

      Object.keys(helpDescriptions).forEach((e) => {
        embed.addField(e, helpDescriptions[e].desc, false);
      });
      message.channel.send(embed);
    } else if (args[0] && helpDescriptions[args[0]]) {
      Object.values(helpDescriptions[args[0]].usage).forEach((e) => {
        message.channel.send(e);
      });
    } else {
      message.channel.send(
        `${message.author} You most likely spelled the command wrong. Please check your spelling.`
      );
    }
  },
};

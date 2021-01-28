const fetch = require("node-fetch");
const https = require("https");
const stream = require("stream");
const Discord = require("discord.js");

const filterData = (data) => {
  if (data) {
    let list = data
      .toString()
      .replace(/[\t\n\r]/gm, "")
      .split('"');

    list = list.filter(Boolean).slice(4);
    let filtered = list.filter(
      (n) =>
        n !== "Guild Master" &&
        n !== "Guild Officer" &&
        n !== "Admin" &&
        n !== "Right Hand" &&
        n !== "Recruiter" &&
        n !== "Gatherer" &&
        n !== "Inactive" &&
        n !== "Wallet Alt GM" &&
        n !== "Fricks Alt"
    );
    let i = Math.floor(filtered.length / 3);

    while (i--) {
      filtered.splice((i + 1) * 3 - 3, 1);
    }
    return filtered;
  }
};

const formatEmbed = (data, args) => {
  let filteredData = filterData(data);
  if (filteredData) {
    let taxevaders = [];
    filteredData.forEach((el) => {
      if (isNaN(el)) return;
      if (el == 0) return;

      if (+el < args[0]) {
        let index = filteredData.indexOf(el);
        taxevaders.push(filteredData[index - 1]);
        taxevaders.push(filteredData[index]);
      }
    });
    let exampleEmbed = new Discord.MessageEmbed()
      .setColor("#009911")
      .setTitle("🔪 Tax Evaders 🔪")
      .setTimestamp();

    let y = 0;
    while (y <= taxevaders.length) {
      if (!taxevaders[y]) break;
      else if (y >= 48) {
        exampleEmbed.addField(
          `And ${(taxevaders.length - y) / 2} more.`,
          "React with ✅ to see them.",
          false
        );
      }
      exampleEmbed.addField(taxevaders[y], taxevaders[y + 1], true);
      y += 2;
    }
    return { 0: exampleEmbed, 1: taxevaders };
  }
};

module.exports = {
  name: "taxes",
  args: true,
  usage: "<min tax ammount>",
  cooldown: 30,
  permissions: "MENTION_EVERYONE",
  description: "Did you pay your taxes?",
  execute(message, args) {
    if (args[0]) {
      let url = message.attachments.array()[0].url;
      const chunks = [];
      https
        .get(url, (res) => {
          res.on("readable", () => {
            let chunk;
            while ((chunk = res.read()) !== null) {
              chunks.push(chunk);
            }
          });
          res.on("end", () => {
            console.log(
              `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
            );

            let taxEmbed = formatEmbed(chunks.join(""), args);
            message.channel
              .send(taxEmbed[0])
              .then((m) => m.react("✅"))
              .then((m) => {
                const filter = (reaction, user) => {
                  return (
                    reaction.emoji.name === "✅" &&
                    user.id === message.author.id
                  );
                };

                const collector = m.message.createReactionCollector(filter, {
                  time: 10000,
                });
                collector.on("collect", () => {
                  if (taxEmbed[1].length >= 25)
                    message.channel.send(taxEmbed[1].slice(48));
                });
              });
          });
        })
        .on("error", (e) => {
          console.log(e);
        });
    }
  },
};

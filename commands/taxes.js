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
      if (!taxevaders[y]) {
        break;
      }
      exampleEmbed.addField(taxevaders[y], taxevaders[y + 1], true);
      y += 2;
    }
    console.log("sent");
    return exampleEmbed;
  }
};

module.exports = {
  name: "taxes",
  args: true,
  usage: "<min tax ammount>",
  cooldown: 2,
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
            return message.channel.send(formatEmbed(chunks.join(""), args));
          });
        })
        .on("error", (e) => {
          console.log(e);
        });
    }
  },
};

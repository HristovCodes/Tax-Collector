const fetch = require("node-fetch");
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

const formatEmbed = (data, args, deposits) => {
  let filteredData = filterData(data);
  let lastUserName = "";
  if (filteredData) {
    let taxevaders = [];
    filteredData.forEach((el) => {
      if (isNaN(el)) {
        lastUserName = el;
        return;
      }
      if (el <= 0) return;

      if (deposits) {
        if (+el >= args[0]) {
          let index = filteredData.indexOf(lastUserName);
          taxevaders.push(filteredData[index]);
          taxevaders.push(filteredData[index + 1]);
        }
      } else if (+el < args[0]) {
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

const getPageContent = async (message) => {
  let response = await fetch(message.attachments.array()[0].url)
    .then((res) => res.text())
    .then((body) => {
      return body;
    });
  if (!response) throw new Error(`Https error! Response: ${response.status}`);
  return response;
};

module.exports = {
  name: "taxes",
  args: true,
  usage: "<min tax ammount>",
  cooldown: 30,
  permissions: "MENTION_EVERYONE",
  description: "Did you pay your taxes?",
  execute(message, args) {
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.member.user.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (args[0]) {
      getPageContent(message).then((dropTaxes) => {
        let filter = () => {
          return true;
        };

        message.channel
          .send("Paste silver deposit logs now, I'll wait 10 secs.")
          .then(() => {
            message.channel
              .awaitMessages(filter, { max: 1, timer: 10000, errors: ["time"] })
              .then((secondMessage) => {
                getPageContent(secondMessage.first()).then((silverDeposits) => {
                  console.log(formatEmbed(dropTaxes, args, false)[1]);
                  console.log(formatEmbed(silverDeposits, args, true)[1]);
                });
              })
              .catch((collected) => {
                console.log(collected.size);
              });
          });

        // create an embed message that will be displayed to the user
        // let taxEmbed = formatEmbed(dropTaxes, args);
        // message.channel
        //   .send(taxEmbed[0])
        //   .then((m) => m.react("✅"))
        //   .then((m) => {
        //     // filter to the listener. looks for a checkmark reaction from
        //     // the user that's using the bot and no one else
        //     const filter = (reaction, user) => {
        //       return (
        //         reaction.emoji.name === "✅" && user.id === message.author.id
        //       );
        //     };

        //     const collector = m.message.createReactionCollector(filter, {
        //       time: 10000,
        //     });
        //     collector.on("collect", () => {
        //       if (taxEmbed[1].length >= 25)
        //         return message.channel.send(taxEmbed[1].slice(48));
        //     });
        //   });
      });
    }
  },
};

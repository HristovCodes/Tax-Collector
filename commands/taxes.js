const fetch = require("node-fetch");
const stream = require("stream");
const Discord = require("discord.js");

const filterData = (data, args, deposits) => {
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

    let lastUserName = "";
    let taxevaders = [];
    filtered.forEach((el) => {
      if (isNaN(el)) {
        lastUserName = el;
        return;
      }
      if (el <= 0) return;

      if (deposits) {
        if (+el >= args[0]) {
          let index = filtered.indexOf(lastUserName);
          taxevaders.push(filtered[index]);
          taxevaders.push(filtered[index + 1]);
        }
      } else if (+el < args[0]) {
        let index = filtered.indexOf(el);
        taxevaders.push(filtered[index - 1]);
        taxevaders.push(filtered[index]);
      }
    });
    return taxevaders;
  }
};

const formatEmbed = (taxevaders) => {
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
  return exampleEmbed;
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

const cleanupList = (taxes, deposits) => {
  deposits.forEach((el) => {
    if (taxes.includes(el) && isNaN(el)) {
      taxes.splice(taxes.indexOf(el), 2);
    }
  });
  return taxes;
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
                  let taxesList = filterData(dropTaxes, args, false);
                  let depositsList = filterData(silverDeposits, args, true);
                  let cleanedList = cleanupList(taxesList, depositsList);
                  let finalEmbed = formatEmbed(cleanedList);

                  message.channel
                    .send(finalEmbed)
                    .then((m) => m.react("✅"))
                    .then((m) => {
                      // filter to the listener. looks for a checkmark reaction from
                      // the user that's using the bot and no one else
                      const filter = (reaction, user) => {
                        return (
                          reaction.emoji.name === "✅" &&
                          user.id === message.author.id
                        );
                      };

                      const collector = m.message.createReactionCollector(
                        filter,
                        {
                          time: 10000,
                        }
                      );
                      collector.on("collect", () => {
                        if (cleanedList.length >= 25) {
                          m.message.reactions
                            .removeAll()
                            .catch((e) =>
                              console.log("Failed to remove emojis", e)
                            );
                          return message.channel.send(
                            formatEmbed(cleanedList.slice(48))
                          );
                        }
                      });
                    });
                });
              })
              .catch((collected) => {
                console.log(collected.size);
              });
          });
      });
    }
  },
};

const fetch = require("node-fetch");
const stream = require("stream");
const Discord = require("discord.js");
const { firebase, addAfk, cleanupDates, pullData } = require("../firebase.js");
const { calculateDate } = require("./afk.js");

const filterData = (data, tax, deposits, guildid) => {
  if (data) {
    let list = data
      .toString()
      .replace(
        /Guild Officer|Fricks Alt|Wallet Alt GM|Inactive|Recruiter|Admin|Gatherer|Rank|Player|Guild Role|Amount|[\t\n\r]|^"\d+"/gm,
        ""
      )
      .split('"');

    list = list.filter(Boolean);

    // exclude GM, RH from the list
    while (list.includes("Guild Master")) {
      let i = list.indexOf("Guild Master");
      list.splice(i - 1, 3);
    }
    while (list.includes("Right Hand")) {
      let i = list.indexOf("Right Hand");
      list.splice(i - 1, 3);
    }

    let lastUserName = "";
    let taxevaders = [];
    list.forEach((el) => {
      if (isNaN(el)) {
        lastUserName = el;
        return;
      }
      if (el * 1 <= 0) {
        return;
      }

      let index = list.indexOf(lastUserName);
      if (deposits) {
        if (+el / tax > 1) {
          // the users has donated for x weeks in advance
          addAfk(
            guildid,
            lastUserName,
            calculateDate(Math.round(+el / tax)),
            Math.round(+el / tax)
          );
        }
        if (+el >= tax) {
          taxevaders.push(list[index]);
          taxevaders.push(list[index + 1]);
        }
      } else if (+el < tax) {
        taxevaders.push(list[index]);
        taxevaders.push(list[index + 1]);
      }
    });
    return taxevaders;
  }
};

const formatEmbed = (taxevaders, m) => {
  let y = 0;
  while (taxevaders[y]) {
    let embed = new Discord.MessageEmbed()
      .setColor("#009911")
      .setTitle("🔪 Tax Evaders 🔪")
      .setFooter("Thanks for using the bot <3")
      .setTimestamp();

    let temp = taxevaders.slice(y, y + 42);
    let x = 0;
    while (true) {
      if (x >= 42 || !temp[x]) {
        m.channel.send(embed);
        break;
      }
      embed.addField(temp[x], temp[x + 1], true);
      x += 2;
      y += 2;
    }
  }
};

const getPageContent = async (message) => {
  let response = await fetch(message.attachments.array()[0].url)
    .then((res) => res.text())
    .then((body) => {
      return body;
    })
    .catch((e) => {
      return e;
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

const dmAllUsers = (usernames, m, tax) => {
  m.client.guilds
    .fetch(m.guild.id)
    .then((guild) =>
      guild.members.fetch().then((members) => {
        let users = [];

        // go through all the users in the list of taxevaders and get their GuildMember object
        usernames.forEach((userEl) => {
          if (isNaN(userEl)) {
            members.array().forEach((userObject) => {
              if (userObject.nickname) {
                if (
                  userObject.nickname
                    .toLowerCase()
                    .includes(userEl.toLowerCase())
                ) {
                  users.push(userObject);
                } else if (
                  userObject.user.username.toLowerCase() == userEl.toLowerCase()
                ) {
                  users.push(userObject);
                }
              } else if (
                userObject.user.username.toLowerCase() == userEl.toLowerCase()
              ) {
                users.push(userObject);
              }
            });
          }
        });

        // if a user is in the AFK list remove him from the list of users to be DM'd
        pullData(`afk/${guild.id}`)
          .then((afkData) => {
            let excused = [];
            let newUsers = users;
            afkData.forEach((el) => {
              newUsers = newUsers.filter((u) => u.user.username != el.afkName);
              members.forEach((member) => {
                if (member.nickname) {
                  if (
                    member.nickname
                      .toLowerCase()
                      .includes(el.afkName.toLowerCase())
                  ) {
                    excused.push({ 0: member, 1: el.afkDate });
                  }
                } else if (
                  member.user.username
                    .toLowerCase()
                    .includes(el.afkName.toLowerCase())
                ) {
                  excused.push({ 0: member, 1: el.afkDate });
                }
              });
            });

            // check for people that are not in the disord
            users.forEach((u) => {
              if (u.nickname) {
                if (usernames.includes(u.nickname))
                  usernames.splice(usernames.indexOf(u.nickname), 2);
                else if (usernames.includes(u.user.username))
                  usernames.splice(usernames.indexOf(u.user.username), 2);
              } else if (usernames.includes(u.user.username))
                usernames.splice(usernames.indexOf(u.user.username), 2);
            });

            let peopleIcouldntDM = [];
            let noDiscord = usernames.filter((el) => isNaN(el));

            // go through everyone that has donated to the guild and message them
            excused.forEach((u) => {
              u[0].user.send(
                `You are exempt from paying until **${u[1]}**.\nThank you for financially supporting OOV! <3`
              );
            });

            // go through all users and direct message each one
            newUsers.forEach((u) => {
              // undefined means no match between nickname and users in the server
              // or in other words he's not in the server or ign =/= nickname
              u.user
                .send(
                  `You need to deposit ${tax} silver in the guild bank, which you can find in the guild tab by pressing G. Please do so by the end of this week.\nIf for any reason you can't donate to the guild please talk to a higher up and sort thing out.`
                )
                .catch(() =>
                  peopleIcouldntDM.push(
                    u.nickname ? u.nickname : u.user.username
                  )
                );
            });
            m.channel.send(
              `These are the IGN's of people that I couldn't find in the discord or don't match their in game name.\n${noDiscord.join(
                ", "
              )}\nThe people that have DM's off: ${peopleIcouldntDM.join(", ")}`
            );
          })
          .catch(console.error);
      })
    )
    .catch(console.error);
};

module.exports = {
  name: "taxes",
  args: true,
  usage: "<min tax ammount>",
  cooldown: 60,
  permissions: "",
  description: "Did you pay your taxes?",
  execute(message, args) {
    cleanupDates(message.guild.id);
    // When someone uses the bot I'll see what they did for easier debugging
    console.log(
      `${message.author.tag} used the bot.\nDate: ${message.createdAt}.\nMessage: ${message.content}\n---------------`
    );

    if (!message.member.hasPermission("MENTION_EVERYONE")) {
      return message.channel.send(
        `You cannot use \$${this.name} here because you are lacking the permission to do so. ${message.author}`
      );
    }
    if (!isNaN(args[0])) {
      if (!message.attachments.array()[0]) {
        return message.channel.send(
          "You forgot to paste the logs. Press CTRL+V to paste them and then type the command again."
        );
      }
      getPageContent(message).then((dropTaxes) => {
        let filter = () => {
          return true;
        };

        message.channel
          .send("Paste silver deposit logs now, I'll wait 60 secs.")
          .then(() => {
            message.channel
              .awaitMessages(filter, { max: 1, timer: 60000, errors: ["time"] })
              .then((secondMessage) => {
                getPageContent(secondMessage.first()).then((silverDeposits) => {
                  let taxesList = filterData(
                    dropTaxes,
                    args[0],
                    false,
                    message.guild.id
                  );
                  let depositsList = filterData(
                    silverDeposits,
                    args[0],
                    true,
                    message.guild.id
                  );
                  let cleanedList = cleanupList(taxesList, depositsList);
                  formatEmbed(cleanedList, message);

                  message.channel
                    .send(
                      "React with ✅ to notify (**private message**) all users."
                    )
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
                          time: 60000,
                        }
                      );
                      collector.on("collect", () => {
                        dmAllUsers(cleanedList, message, args[0]);
                        return message.channel.send(
                          "We are done thanks for using **Tax Collector**. If you need help or have questions talk to <@!416970292305461269>"
                        );
                      });
                    });
                });
              });
          });
      });
    }
  },
};

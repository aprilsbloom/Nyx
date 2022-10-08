var fs = require("fs"), ini = require("ini");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

// discord constants
const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });

client.on("ready", async () => {
  console.log(`${client.user.username}#${client.user.discriminator} is ready!`);

  const Guilds = client.guilds.cache.map((guild) => guild.name);
  console.log(Guilds);
  console.log
});

client.on("messageCreate", (message) => {
  //console.log(message);
});

client.login(config.client.token);

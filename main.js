var fs = require("fs"), ini = require("ini");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
var zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))

// UI
var CLI = require('clui'), Spinner = CLI.Spinner;
var countdown = new Spinner('Logging in...', ['-', '\\', '|', '/']);

// constants
const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });
const prompt = require('prompt-sync')({sigint: true});

async function menu() {
  const guildnames = client.guilds.cache.map((guild) => guild.name);
  const guildids = client.guilds.cache.map((guild) => guild.id);
  var guilddict = {};
  

  countdown.stop();
  console.clear();

  console.log(`Server list for ${client.user.username}#${client.user.discriminator}:\n`);

  for (i in zip([guildnames, guildids])) {
    var index = Number(i) + 1;
    guilddict[index] = guildids[i];
    console.log(`${index}: ${guildnames[i]}`);
  }

  console.log(`\nType the number of the server you want to enter, or type "exit" to exit.`);
  var guildid = prompt("Server number: ");

  if (guildid == "exit") {
    process.exit(0);
  }

  else if (guildid in guilddict) {
    channellist = await getChannelList(guilddict, guildid);
  }

  else {
    console.log("Invalid server number.");
    process.exit(0);
  }
}

async function getChannelList(dict, id) {
  const guild = await client.guilds.fetch(dict[id]);
  const channelnames = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT").map((channel) => channel.name);
  const channelids = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT").map((channel) => channel.id);
  var channeldict = {};

  console.clear();
  console.log(`Channel list for ${guild.name}:\n`);

  for (i in zip([channelnames, channelids])) {
    var index = Number(i) + 1;
    channeldict[index] = channelids[i];
    console.log(`${index}: #${channelnames[i]}`);
  }

  console.log(`\nType the number of the channel you want to enter, or type "exit" to return back to the menu.`);
  var channelid = prompt("Channel number: ");

  if (channelid == "exit") {
    menu();
  }

  else if (channelid in channeldict) {
    await getMessages(channeldict, channelid);
  }

  else {
    console.log("Invalid server number.");
    process.exit(0);
  }
}

async function getMessages(dict, id) {
  const channel = await client.channels.fetch(dict[id]);
  const channelid = channel.id;
  const messages = await channel.messages.fetch({ limit: 25 })

  console.clear();
  console.log(`Message list for #${channel.name}:\n`);

  for (const [id, message] of messages.reverse()) {
    console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
  }

  fs.writeFile('channelid.txt', channelid, function (err) {
    if (err) {
      return console.log(err);
    }
  });
}

client.on("ready", async () => {
  menu()
});

client.on("messageCreate", (message) => {
  var channelid = fs.readFileSync('channelid.txt', 'utf8');
  try {
    if (message.channel.id === channelid) {
      console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
    }
  }

  catch (err) {
    void(0)
  }
});

console.clear()
countdown.start();

client.login(config.client.token);

// basic vars
var fs = require("fs"), ini = require("ini");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
var zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))

// UI
var CLI = require('clui'), Spinner = CLI.Spinner;
var countdown = new Spinner('Logging in...', ['◜','◠','◝','◞','◡','◟']);
var blessed = require('blessed');
var screen = blessed.screen({
  smartCSR: true,
});

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

  console.log(`Server list for ${client.user.tag}:\n`);

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
    await getChannelList(guilddict, guildid);
  }

  else {
    console.log("Invalid server number.");
    process.exit(0);
  }
}

async function getChannelList(dict, id) {
  const guild = await client.guilds.fetch(dict[id]);
  global.channel_names = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT").map((channel) => channel.name);
  global.channel_ids = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT").map((channel) => channel.id);
  global.member_names = guild.members.cache.map((member) => member.user.username);
  global.member_ids = guild.members.cache.map((member) => member.user.id);
  var channeldict = {};

  console.clear();
  console.log(`Channel list for ${guild.name}:\n`);

  for (i in zip([channel_names, channel_ids])) {
    var index = Number(i) + 1;
    channeldict[index] = channel_ids[i];
    console.log(`${index}: #${channel_names[i]}`);
  }

  console.log(`\nType the number of the channel you want to enter, or type "exit" to return back to the menu.`);
  var channelid = prompt("Channel number: ");

  if (channelid == "exit") {
    menu();
  }

  else if (channelid in channeldict) {
    console.clear()
    screen.title = "Discord CLI Client";

    global.ChannelListBox = blessed.log({
      top: "top",
      left: "left",
      width: "15%",
      height: "100%",
      content: "Channel List:",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        border: {
          fg: "white",
        },
      },
    });

    global.MessagesBox = blessed.log({
      left: "15%",
      width: "71%",
      height: "86%",
      content: "Messages:",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        border: {
          fg: "white",
        },
      },
    });

    global.EnterMessageBox = blessed.textbox({
        top: "86%",
        left: "15%",
        width: "71%",
        height: "17%",
        content: "Enter Message:",
        inputOnFocus: true,
        tags: true,
        border: {
          type: "line",
        },
        style: {
          fg: "white",
          border: {
            fg: "white",
          },
        },
    });

    global.MemberList = blessed.log({
        left: "86%",
        width: "14.83%",
        height: "100%",
        content: "Member List:",
        tags: true,
        border: {
          type: "line",
        },
        style: {
          fg: "white",
          border: {
            fg: "white",
          },
        },
    });


    // Append our box to the screen.
    screen.append(ChannelListBox);
    screen.append(MessagesBox);
    screen.append(EnterMessageBox);
    screen.append(MemberList);

    

    EnterMessageBox.key('enter', function(ch, key) {
        MessagesBox.log(`${client.user.tag}: ${EnterMessageBox.value}`);
        client.channels.cache.get(channeldict[channelid]).send(EnterMessageBox.value);
        EnterMessageBox.clearValue();
        EnterMessageBox.focus();
        screen.render();
    });

    // Render the screen.
    EnterMessageBox.focus();
    screen.render();

    await getMessages(channeldict, channelid);
  }

  else {
    console.log("Invalid server number.");
    process.exit(0);
  }
}

async function getMessages(dict, id) {
  const channel = await client.channels.fetch(dict[id]);
  const messages = await channel.messages.fetch({ limit: 25 })
  global.channelid = channel.id;

  for (const [id, message] of messages.reverse()) {
    try {
      MessagesBox.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
    }

    catch {
      void(0);
    }
  }

  for (i in zip([channel_names, channel_ids])) {
    if (channel_names[i] == channel.name) {
      ChannelListBox.log(`#{bold}${channel_names[i]}{/bold}`);
    }

    else {
      ChannelListBox.log(`#${channel_names[i]}`);
    }
  }

  for (i in zip([member_names, member_ids])) {
    MemberList.log(`${member_names[i]}`);
  }

  EnterMessageBox.focus();
}

client.on("ready", async () => {
  menu()
});

client.on("messageCreate", (message) => {
  try {
    if (message.author.id != client.user.id) {
      if (message.channel.id === window.channelid) {
        MessagesBox.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
      }
    }
  }

  catch {
    void(0);
  }
});

console.clear()
countdown.start();

client.login(config.client.token);
var ini = require("ini");
var fs = require("fs");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
var zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));

var blessed = require('blessed')
var contrib = require('blessed-contrib')

var startkey = '{black-fg}{white-bg}'
var endkey = '{/black-fg}{/white-bg}'


const hyperlinker = require('hyperlinker');
const supportsHyperlinks = require('supports-hyperlinks');

if (config.unicode == "true") {
  var screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    autoPadding: true
  });
} 

else {
  var screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    autoPadding: true
  });
}

var focused = 0;
channel_id = "a";

const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });

async function convertunix(unix) {
  var date = new Date(unix);
  var hour = date.getHours().toString();
  var minute = date.getMinutes().toString();
  var second = date.getSeconds().toString();

  if (hour.length == 1) {
    hour = "0" + hour;
  }

  if (minute.length == 1) {
    minute = "0" + minute;
  }

  if (second.length == 1) {
    second = "0" + second;
  }

  var formattedTime = `${hour}:${minute}:${second}`;
  return formattedTime;
}

client.on("ready", async () => {
  global.guildnames = client.guilds.cache.map((guild) => guild.name);
  global.guildids = client.guilds.cache.map((guild) => guild.id);
  var serverlist_dict = { extended: true, children: {} };

  for (i in zip([guildnames, guildids])) {
    serverid = guildids[i];
    servername = guildnames[i];

    var guild = await client.guilds.fetch(serverid);
    var channel_names = guild.channels.cache
      .filter((channel) => channel.type === "GUILD_TEXT")
      .map((channel) => channel.name);
    var channel_ids = guild.channels.cache
      .filter((channel) => channel.type === "GUILD_TEXT")
      .map((channel) => channel.id);

    serverlist_dict["children"][servername] = {}
    serverlist_dict["children"][servername]["children"] = {}

    for (j in zip([channel_names, channel_ids])) {
      var index = j + 1;
      const channel = await client.channels.fetch(channel_ids[j]);
      channel_viewable = channel.permissionsFor(client.user).has("VIEW_CHANNEL");
      
      if (channel_viewable) {
        serverlist_dict["children"][servername]["children"][index] = {
          name: `#${channel_names[j]}`,
          myCustomProperty: channel_ids[j],
        };
      }
    }
  }

  ServerList.setData(JSON.parse(JSON.stringify(serverlist_dict)));
  ServerList.focus();
  screen.render();
});

async function getMessages(id) {
  const channel = await client.channels.fetch(id);
  global.messages = await channel.messages.fetch({ limit: 100 });

  ServerList.setLabel(` {bold}${server_name}{/bold} `);
  MessagesBox.setLabel(` {bold}#${channel.name}{/bold} `);
  MessagesBox.setContent("");

  for (const [id, message] of messages.reverse()) {
    try {
      const attatchments = message.attachments.map(
        (attachments) => attachments.url
      );

      if (attatchments.length != 0) {
        if (message.cleanContent.length != 0) {
          MessagesBox.log(
            `${await convertunix(message.createdTimestamp)} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
          );
        } 
        
        else {
          MessagesBox.log(
            `${await convertunix(message.createdTimestamp)} ${message.author.username}#${message.author.discriminator}: ${attatchments}`
          );
        }
      } 
      
      else {
        MessagesBox.log(
          `${await convertunix(message.createdTimestamp)} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
        );
      }
    } 
    
    catch {
      void 0;
    }
  }
}

client.on("messageCreate", async (message) => {
  try {
    if (message.channel.id === channel_id) {
      const attatchments = message.attachments.map(
        (attachments) => attachments.url
      );
      var time = await convertunix(message.createdTimestamp);
      if (attatchments.length != 0) {
        MessagesBox.log(
          `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
        );
      } 
      
      else {
        MessagesBox.log(
          `${await convertunix(message.createdTimestamp)} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
        );
      }
    }
  } 
  
  catch {
    void 0;
  }
});

async function sendMessage(id, message) {
  const channel = await client.channels.fetch(id);
  var channel_sendable = channel.permissionsFor(client.user).has("SEND_MESSAGES");

  if (channel_sendable) {
    client.channels.cache.get(id).send(message);
  }

  else {
    let time = await convertunix(Date.now());
    MessagesBox.log(`${time} {red-fg}{bold}Error:{/red-fg}{/bold} You do not have permission to send messages in this channel.`);
  }
}

async function checkIfEmpty(str) {
  str = str.trim()
  if (str === '') {
    return true
  } 
  
  else if (str !== '') {
    return false
  }
}

global.ServerList = contrib.tree({
  top: "top",
  left: "left",
  width: "15%",
  height: "100%",
  label: " {bold}Server List{/bold} ",
  tags: true,
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    border: {
      fg: "white",
    },
    selected: {
      fg: "black",
      bg: "white",
    },
  },
});

global.MessagesBox = blessed.log({
  left: "15%",
  width: "85.4%",
  height: "86%",
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

global.EnterMessageBox = blessed.textarea({
  top: "86%",
  left: "15%",
  width: "85.4%",
  height: "16%",
  tags: true,
  border: {
    type: "line",
  },
  label: " {bold}Enter Message{/bold} ",
  style: {
    fg: "white",
    border: {
      fg: "white",
    },
  },
});

ServerList.on('select', async function(node) {
  if (node.myCustomProperty){
    global.channel_id = node.myCustomProperty;
    global.server_name = node.parent.name;
    EnterMessageBox.clearValue();
    await getMessages(node.myCustomProperty);
  }

  global.server_name = ' {bold}Server List{/bold} ';
  screen.render();
}),

screen.key(['tab'], function(ch, key) {
  if (focused === 0) {
    focused = 1;
    EnterMessageBox.focus();
    EnterMessageBox.input();

    screen.render();
  }
});

EnterMessageBox.key(['enter'], async function(ch, key) {
  if (channel_id != 'a') {
    let message = await checkIfEmpty(EnterMessageBox.getValue());
    if (message === false) {
      await sendMessage(channel_id, EnterMessageBox.getValue());
    }

    else if (message === true) {
      let time = await convertunix(Date.now());
      MessagesBox.log(`${time} {red-fg}{bold}Error:{/bold}{/red-fg} You cannot send an empty message.`);
    }
  }

  else if (channel_id === 'a') {
    let time = await convertunix(Date.now());
    MessagesBox.log(`${time} {red-fg}{bold}Error:{/bold}{/red-fg} You must select a channel to send a message.`);
  }

  EnterMessageBox.clearValue();
  screen.render();
});

EnterMessageBox.key(['tab'], function(ch, key) {
  focused = 0;
  ServerList.focus();
  screen.render();
});

screen.key(['escape', 'C-c'], function(ch, key) {
  return process.exit(0);
});

ServerList.focus();

screen.append(ServerList);
screen.append(MessagesBox);
screen.append(EnterMessageBox);

MessagesBox.log('{bold}Welcome to Discord Terminal!{/bold}');

if (supportsHyperlinks.stdout) {
  MessagesBox.log(`This client was written by ${hyperlinker('paintingofblue', 'https://github.com/paintingofblue')} in JavaScript. It is still in development, so expect bugs.`);
  MessagesBox.log(`If you have downloaded this outside of GitHub, you can find the source code ${hyperlinker('here', 'https://github.com/paintingofblue/discord-terminal-client')}\n`);
}
else {
  MessagesBox.log(`This client was written by paintingofblue in JavaScript. It is still in development, so expect bugs.`);
  MessagesBox.log(`If you have downloaded this outside of GitHub, you can find the source code here: https://github.com/paintingofblue/discord-terminal-client\n`);
}

MessagesBox.log(`To get started, press ${startkey}Tab${endkey} to switch to the message box, use the ${startkey}Arrow Keys${endkey} to navigate & ${startkey}Enter${endkey} to select items in the list.`);
MessagesBox.log(`Press ${startkey}Tab${endkey} again to switch back to the server list.`)
MessagesBox.log(`Press ${startkey}Enter${endkey} to send a message when the message box is focused.`);
MessagesBox.log(`Press ${startkey}Escape${endkey} to exit.`);

screen.render();

client.login(config.client.token);
var blessed = require('blessed')
, contrib = require('blessed-contrib')
, screen = blessed.screen({
    smartCSR: true,
    fullUnicode: false,
    dockBorders: true,
    grabKeys: true
})

var ini = require("ini");
var fs = require("fs");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
var zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));

const { Client } = require("discord.js-selfbot-v13");
const { convert } = require('node-blessed/lib/colors');
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
      global.channel = await client.channels.fetch(channel_ids[j]);
      global.channel_viewable = channel
        .permissionsFor(client.user)
        .has("VIEW_CHANNEL");
      
      if (channel_viewable) {
        serverlist_dict["children"][servername]["children"][index] = {
          name: `#${channel_names[j]}`,
          myCustomProperty: channel_ids[j],
        };
      }
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
    inputOnFocus: true,
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
    global.channel_id = node.myCustomProperty;
    if (node.myCustomProperty){
      global.server_name = node.parent.name;
      await getMessages(node.myCustomProperty);
    }

    global.server_name = ' {bold}Server List{/bold} ';
    screen.render();
  }),

  ServerList.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  ServerList.setData(JSON.parse(JSON.stringify(serverlist_dict)));
  ServerList.focus();

  screen.append(ServerList);
  screen.append(MessagesBox);
  screen.append(EnterMessageBox);

  screen.render();
});

async function getMessages(id) {
  global.channel = await client.channels.fetch(id);
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

      if (attatchments.length != 0) {
        MessagesBox.log(
          `${await convertunix(message.createdTimestamp)} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
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
  client.channels.cache.get(id).send(message);
}

client.login(config.client.token);
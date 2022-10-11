// basic vars
var fs = require("fs"),
  ini = require("ini");
var config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
var zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));

// UI
var CLI = require("clui"),
  Spinner = CLI.Spinner;
var login_spinner = new Spinner("Logging in...", [
  "◜",
  "◠",
  "◝",
  "◞",
  "◡",
  "◟",
]);
var blessed = require("blessed");

// constants
const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });
const prompt = require("prompt-sync")({ sigint: true });

async function menu() {
  const guildnames = client.guilds.cache.map((guild) => guild.name);
  const guildids = client.guilds.cache.map((guild) => guild.id);
  var guilddict = {};

  login_spinner.stop();
  console.clear();

  var screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
  });

  screen.title = `Logged in as ${client.user.tag}`;
  console.log(`Server list for ${client.user.tag}:\n`);

  for (i in zip([guildnames, guildids])) {
    var index = Number(i) + 1;
    guilddict[index] = guildids[i];
    console.log(`${index}: ${guildnames[i]}`);
  }

  console.log(
    `\nType the number of the server you want to enter, or type "exit" to exit.`
  );
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
  global.guild = await client.guilds.fetch(dict[id]);
  global.channel_names = guild.channels.cache
    .filter((channel) => channel.type === "GUILD_TEXT")
    .map((channel) => channel.name);
  global.channel_ids = guild.channels.cache
    .filter((channel) => channel.type === "GUILD_TEXT")
    .map((channel) => channel.id);
  global.member_names = guild.members.cache.map(
    (member) => member.user.username
  );
  global.member_ids = guild.members.cache.map((member) => member.user.id);
  global.channeldict = {};

  console.clear();

  for (i in zip([channel_names, channel_ids])) {
    var index = Number(i) + 1;
    channeldict[index] = channel_ids[i];
  }

  var channelnum = "1";
  getChannel(channelnum);
}

async function getChannel(channelnum) {
  console.clear();

  screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
  });

  global.ChannelListBox = blessed.log({
    top: "top",
    left: "left",
    width: "15%",
    height: "100%",
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
    keys: true,
  });

  global.MessagesBox = blessed.log({
    left: "15%",
    width: "71%",
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

  global.EnterMessageBox = blessed.textbox({
    top: "86%",
    left: "15%",
    width: "71%",
    height: "17%",
    inputOnFocus: true,
    tags: true,
    border: {
      type: "line",
    },
    label: " Enter Message ",
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
    tags: true,
    border: {
      type: "line",
    },
    label: " Member List ",
    style: {
      fg: "white",
      border: {
        fg: "white",
      },
    },
  });

  MessagesBox.setLabel(` #${channel_names[channelnum - 1]} `);
  ChannelListBox.setLabel(` ${guild.name} `);

  // make ui
  screen.append(ChannelListBox);
  screen.append(MessagesBox);
  screen.append(EnterMessageBox);
  screen.append(MemberList);

  EnterMessageBox.key("enter", function (ch, key) {
    if (EnterMessageBox.getValue().trim().length != 0) {
      // message command handler
      if (EnterMessageBox.getValue() == "*exit") {
        EnterMessageBox.clearValue();
        EnterMessageBox.focus();
        screen.render();

        process.exit(0);
      } 
      
      else if (EnterMessageBox.getValue() == "*menu") {
        EnterMessageBox.clearValue();
        EnterMessageBox.focus();
        screen.render();
        screen.destroy();
        menu();
      } 
      
      else if (EnterMessageBox.getValue() == "*clear") {
        EnterMessageBox.setValue("");
        MessagesBox.setContent("");
        EnterMessageBox.focus();
        screen.render();
      } 
      
      else if (EnterMessageBox.getValue().startsWith("*switchchannel")) {
        var channel_id = EnterMessageBox.getValue().split(" ")[1];
        if (channel_id in channeldict) {
          screen.destroy();
          getChannel(channel_id);
        } 
        
        else {
          MessagesBox.log("Invalid channel number.");
          EnterMessageBox.clearValue();
          EnterMessageBox.focus();
          screen.render();
        }
      }

      // if no command send message
      else {
        try {
          if (channel_viewable == true) {
            if (channel_sendable == true) {
              client.channels.cache
                .get(channeldict[channelnum])
                .send(EnterMessageBox.value);
            } 
            
            else if (channel_sendable == false) {
              MessagesBox.log("{bold}{red-fg}Error:{/red-fg}{/bold} You do not have permission to send messages in this channel.");
            }
          } 

          else if (channel_viewable == false) {
            MessagesBox.log("{bold}{red-fg}Error:{/red-fg}{/bold} You do not have permission to view this channel nor send messages to it.");
          }
        } 

        catch (err) {
          MessagesBox.log(
            `{bold}{red-fg}Error:{/red-fg}{/bold} ${err}}`
          );
        }

        EnterMessageBox.clearValue();
        EnterMessageBox.focus();
        screen.render();
      }
    } 
    
    else {
      MessagesBox.log(
        "{bold}{red-fg}Error:{/red-fg}{/bold} You cannot send an empty message."
    );}

    EnterMessageBox.clearValue();
    EnterMessageBox.focus();
    screen.render();
  });

  // render ui and make message box in focus
  EnterMessageBox.clearValue();
  EnterMessageBox.focus();
  screen.render();

  await getMessages(channeldict, channelnum);
}

async function getMessages(dict, id) {
  global.channel = await client.channels.fetch(dict[id]);
  global.channel_viewable = channel
    .permissionsFor(client.user)
    .has("VIEW_CHANNEL");
  global.channel_sendable = channel
    .permissionsFor(client.user)
    .has("SEND_MESSAGES");
  global.channelid = channel.id;

  try {
    global.messages = await channel.messages.fetch({ limit: 50 });

    for (const [id, message] of messages.reverse()) {
      try {
        const attatchments = message.attachments.map(
          (attachments) => attachments.url
        );

        if (attatchments.length != 0) {
          MessagesBox.log(
            `${message.author.username}#${message.author.discriminator}: ${message.cleanContent}${attatchments}`
          );
        } 
        
        else {
          MessagesBox.log(
            `${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
          );
        }
      } 
      
      catch {
        void 0;
      }
    }
  } 
  
  catch {
    MessagesBox.log(
      "{bold}{red-fg}Error:{/red-fg}{/bold} You don't have access to this channel."
    );
  }

  ChannelListBox.log("");
  for (i in zip([channel_names, channel_ids])) {
    var index = Number(i) + 1;
    if (channel_names[i] == channel.name) {
      ChannelListBox.log(`{#000000-fg}{#ffffff-bg}${index}. #${channel_names[i]}{/#ffffff-bg}{/#000000-fg}`);
    } 
    
    else {
      ChannelListBox.log(`${index}. #${channel_names[i]}`);
    }
  }

  for (i in zip([member_names, member_ids])) {
    MemberList.log(`- ${member_names[i]}`);
  }

  EnterMessageBox.focus();
}

client.on("ready", async () => {
  menu();
});

client.on("messageCreate", (message) => {
  try {
    if (message.channel.id === channelid) {
      const attatchments = message.attachments.map(
        (attachments) => attachments.url
      );
      if (attatchments.length != 0) {
        MessagesBox.log(
          `${message.author.username}#${message.author.discriminator}: ${message.cleanContent} ${attatchments}`
        );
      } 
      
      else {
        MessagesBox.log(
          `${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
        );
      }
    }
  } 
  
  catch {
    void 0;
  }
});

console.clear();
login_spinner.start();

client.login(config.client.token);

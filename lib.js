/* <- imports -> */
const { Ui } = require("./ui");
const { Client } = require("discord.js-selfbot-v13")


/* <- termclient class -> */
class TermClient {
  constructor(config) {
    let self = this; // little workaround for fixing issues with `this` in `this.ui` functions, js scoping is weird

    this._config = config;
    this._discord = new Client({ checkUpdate: false });

    this.server = null;

    this.channel_id = null;
    this.guilds = null;

    this._discord.on("ready", async () => {
      self.guilds = self._discord.guilds.cache;
      self.ui._screen.title = `Nyx - ${self._discord.user.username}#${self._discord.user.discriminator}`;
      await self.on_ready(self._discord);
    });

    this._discord.on("messageCreate", async (message) => {
      await self.on_message(self._discord, message);
    });

    this.ui = new Ui(self._config.client.unicode === "true");

    this.ui.on_box_send = async function(message) {
      if (Utils.checkIsEmpty(message)) {
        self.ui.log_error("_messagesBox", "You can't send an empty message!");
      }
      else {
        if (self.channel_id == null) {
          self.ui.log_error("_messagesBox", "You need to select a channel first!");
        }
        else {
          await self.sendMessage(message);
        }
      }
    }

    this.ui.on_server_select = async function(node) {
      self.server = {
        name: node.parent.name,
        id: node.parent.id,
      };
      self.channel_props = {
        name: node.name,
        id: node.id,
      };

      self.ui._enterMessageBox.setLabel(self.channel_props["name"]);

      self.channel_id = node.channel_id;
      let history = await self.getMessages(node.channel_id);

      if (history.dm) {
        self.ui._serverList.setLabel("{bold}DMs{/bold}");
        self.ui._messagesBox.setLabel(`{bold}${node.name}{/bold}`);
      } else {
        self.ui._serverList.setLabel(`{bold}${self.server["name"]}{/bold}`);
        self.ui._messagesBox.setLabel(`{bold}${self.channel_props["name"]}{/bold}`);
      }

      for (let [id, message] of history.messages) {
        try {
          let time = Utils.convertUnix(message.createdTimestamp);
          if (history.dm) {
            self.ui.log_text("_messagesBox", `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
          }
          else if (message.member) {
            self.ui.log_text("_messagesBox", `${time} ${message.member.nickname} (${message.author.username}#${message.author.discriminator}): ${message.cleanContent}`);
          }
          else {
            self.ui.log_text("_messagesBox", `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
          }
        }
        catch {
          void 0;
        }
      }
    };

    this.ui.when_ready = async function(ui) {
      // - guilds -
      let guild_names = self.guilds.map((g) => g.name);
      let guild_ids = self.guilds.map((g) => g.id);

      let server_list_data = {
        extended: true,
        children: {
          DMs: {
            children: {},
          },
          Servers: {
            children: {},
          },
        }
      };

      for (let i in Utils.zip([guild_names, guild_ids])) {
        self.server = {
          name: guild_names[i],
          id: guild_ids[i],
        };

        let guild = await self._discord.guilds.fetch(self.server["id"]);
        let channels = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");

        server_list_data["children"]["Servers"]["children"][self.server["name"]] = { children: {} };

        for (let j in Utils.zip([channels.map((c) => c.name), channels.map((c) => c.id)])) {
          self.channel_props = {
            name: channels.map((c) => c.name)[j],
            id: channels.map((c) => c.id)[j],
          };

          let channel = await self._discord.channels.fetch(self.channel_props["id"]);
          let is_viewable = channel.permissionsFor(self._discord.user).has("VIEW_CHANNEL");

          if (is_viewable) {
            server_list_data["children"]["Servers"]["children"][self.server["name"]]["children"][j + 1] = {
              name: `#${self.channel_props["name"]}`,
              channel_id: self.channel_props["id"],
            };
          }
        }
      }


      // - dms -
      let dms = self._discord.channels.cache.map((c) => {
        switch(c.type) {
          case "DM":
            return {
              name: c.recipient ? c.recipient.username : null,
              id: c.id,
              type: c.type,
              position: c.lastMessageId,
            };
            break;

          case "GROUP_DM":
            return {
              name: c.name == null ? c.recipients.map((u) => u.username).join(", ") : c.name,
              id: c.id,
              type: c.type,
              position: c.lastMessageId,
            };
            break;

          default:
            return {
              name: c.name,
              id: c.id,
              type: c.type,
              position: c.lastMessageId,
            };
            break;
        }
      }).filter((c) => c.type.includes("DM")).sort((x, y) => y.position - x.position);
      let dm_names = dms.map((d) => d.name);
      let dm_ids = dms.map((d) => d.id);

      for (let i in Utils.zip([dm_names, dm_ids])) {
        server_list_data["children"]["DMs"]["children"][i] = {
          name: dm_names[i],
          channel_id: dm_ids[i],
        };
      }


      // set the data yk
      ui._serverList.setData(server_list_data);
    }

    //this._loginSpinner = this.ui.spinner("Connecting...", ["-", "\\", "|", "/"]);
    //this._loginSpinner.start();
    this.ui.draw_box("Login", "Logging in...");
  }

  async on_ready(client) {
    return;
  }

  async on_message(client, message) {
    return;
  }

  async getMessages(channel_id) {
    let channel = await this._discord.channels.fetch(channel_id);
    let hist = await channel.messages.fetch({ limit: 100 });

    return {
      dm: channel.type.includes("DM"),
      messages: hist.reverse(),
    };
  }

  async sendMessage(content) {
    let channel = await this._discord.channels.fetch(this.channel_id);
    let time = Utils.convertUnix(Date.now());

    if (channel.type.includes("DM")) {
      channel.send(content);
      this.ui.log_text("_messagesBox", `${time} ${this._discord.user.username}#${this._discord.user.discriminator}: ${content.trim()}`);
    }
    else {
      let can_send = channel.permissionsFor(this._discord.user).has("SEND_MESSAGES");
      if (can_send) {
        channel.send(content);
        this.ui.log_text("_messagesBox", `${time} ${this._discord.user.username}#${this._discord.user.discriminator}: ${content.trim()}`);
      }
      else this.ui.log_error("_messagesBox", "You can't send messages here!");
    }
  }

  async command_handler(content) {
    return;
  }

  start() {
    this.ui._screen.title = "Nyx - Logging in";
    this._discord.login(this._config.client.token);
  }
}


/* <- utils -> */
Utils = {
  zip: function(rows) {
    return rows[0].map((_, c) => rows.map((row) => row[c]));
  },

  checkIsEmpty: function(str) {
    return str.trim() === '';
  },

  convertUnix: function(timestamp) {
    let date = new Date(timestamp);
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();

    hour = hour.length == 1 ? `0${hour}` : hour;
    minute = minute.length == 1 ? `0${minute}` : minute;
    second = second.length == 1 ? `0${second}` : second;

    return `${hour}:${minute}:${second}`;
  },

  writeHelp: function(ui, area) {
    ui.log_text(area, "This is an indev version of the client at https://github.com/paintingofblue/discord-terminal-client. Modified by 13-05.");
  }
}


/* <- exports -> */
module.exports = { 
  TermClient,
  Utils,
};

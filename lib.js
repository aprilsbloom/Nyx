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
    this.channel = null;

    this.channel_id = null;
    this.guilds = null;

    this._discord.on("ready", async () => {
      self.guilds = self._discord.guilds.cache;
      await self.on_ready(self._discord);
    });

    this._discord.on("messageCreate", async (message) => {
      await self.on_message(self._discord, message);
    });

    this.ui = new Ui(self._config.client.unicode === "true");

    this.ui.on_server_select = async function(node) {
      self.server = {
        name: node.parent.name,
        id: node.parent.id,
      };
      self.channel_props = {
        name: node.name,
        id: node.id,
      };
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
          self.ui.log_text("_messagesBox", `${time} ${message.author.username}#${message.author.discriminator}: ${message.content}`);
        } catch {
          void 0;
        }
      }
    };

    this.ui.when_ready = async function(ui) {
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

      ui._serverList.setData(server_list_data);
    }

    this._loginSpinner = this.ui.spinner("Connecting...", ["-", "\\", "|", "/"]);
    this._loginSpinner.start();
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
      dm: channel.type === "DM",
      messages: hist.reverse(),
    };
  }

  start() {
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

/* <- imports -> */
const { Ui } = require("./ui");
const { Client } = require("discord.js-selfbot-v13")

/* <- termclient class -> */
class TermClient {
  constructor(config) {
    let self = this; // little workaround for fixing issues with `this` in `this.ui` functions, js scoping is weird

    this._config = config;
    this._discord = new Client({ checkUpdate: false });

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
      let message_history = await self.getMessages(node.channel_id);
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
        let server = {
          name: guild_names[i],
          id: guild_ids[i],
        };

        let guild = await self._discord.guilds.fetch(server["id"]);
        let channels = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");

        server_list_data["children"]["Servers"]["children"][server["name"]] = { children: {} };

        for (let j in Utils.zip([channels.map((c) => c.name), channels.map((c) => c.id)])) {
          let channel_props = {
            name: channels.map((c) => c.name)[j],
            id: channels.map((c) => c.id)[j],
          };

          let channel = await self._discord.channels.fetch(channel_props["id"]);
          let is_viewable = channel.permissionsFor(self._discord.user).has("VIEW_CHANNEL");

          if (is_viewable) {
            server_list_data["children"]["Servers"]["children"][server["name"]]["children"][j + 1] = {
              name: `#${channel_props["name"]}`,
              channel_id: channel_props["id"],
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

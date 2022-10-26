/* <- imports -> */
const fetch = require("node-fetch");
const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });
const ini = require("ini");
const fs = require("fs");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const CLI = require("clui"), Spinner = CLI.Spinner;


/* <- config parsing -> */
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));


/* <- globals, functions -> */
// client class to improve code structure; may change reference name in the future
class TermClient {
  constructor() {
    this.channel_id = null; // no channel id when the client's first started 
    this.focused = 0;

    this.data = { extended: true, children: {} }; // previously named `list_dict`

    this.screen = blessed.screen({
      smartCSR: true,
      fullUnicode: config.client.unicode === "true",
      dockBorders: true,
      autoPadding: true,
    });

    this.screen.title = "Discord Terminal Client";
  }

  async getMessages(node_name, id) {
	  const channel = await client.channels.fetch(id);
	  messages = await channel.messages.fetch({ limit: 100 });

	  if (channel.type == "DM") {
	  	ServerList.setLabel(` {bold}DMs{/bold} `);
	  	MessagesBox.setLabel(` {bold}${node_name}{/bold} `);
  	} else {
	  	ServerList.setLabel(` {bold}${server_name}{/bold} `);
	  	MessagesBox.setLabel(` {bold}#${channel.name}{/bold} `);
	  }

	  MessagesBox.setContent("");

	  for (const [id, message] of messages.reverse()) {
	  	try {
	  		const attatchments = message.attachments.map(
	  			(attachments) => attachments.url
	  		);
	  		let time = utils.convertUnix(message.createdTimestamp);

	  		if (attatchments.length != 0) {
	  			if (message.cleanContent.length != 0) {
	  				MessagesBox.log(
	  					`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
	  				);
		  		} else {
		  			MessagesBox.log(
		  				`${time} ${message.author.username}#${message.author.discriminator}: ${attatchments}`
		  			);
			  	}
		  	} else {
		  		MessagesBox.log(
		  			`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
		  		);
		  	}
	  	} catch {
		  	void 0;
		  }
  	}
  }
}

// utils
utils = {
  zip: (rows) => rows[0].map((_, c) => rows.map((row) => row[c])),

  checkIsEmpty: (str) => str.trim() === '',

  convertUnix: (timestamp) => {
    let date = new Date(timestamp);
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();

    hour = hour.length == 1 ? `0${hour}` : hour;
    minute = minute.length == 1 ? `0${minute}` : minute;
    second = second.length == 1 ? `0${second}` : second;

    return `${hour}:${minute}:${second}`;
  },

  writeHelp: (log) => { // `log` is type function; should be a function that accepts a string as its first argument and prints the string, or outputs it in some form.
    log("{bold}Welcome to Discord Terminal!{/bold}");

	  log(
	  	`This client was written by https://github.com/paintingofblue in JavaScript. It is still in development, so expect bugs.`
	  );
	  log(
	  	`If you have downloaded this outside of GitHub, you can find the source code here: https://github.com/paintingofblue/discord-terminal-client\n`
	  );

	  log(
	  	`To get started, press ${startkey}Tab${endkey} to switch to the message box, use the ${startkey}Arrow Keys${endkey} to navigate & ${startkey}Enter${endkey} to select items in the list.`
	  );
    log(
	  	`Press ${startkey}Tab${endkey} again to switch back to the server list.`
	  );
	  log(
	  	`Press ${startkey}Enter${endkey} to send a message when the message box is focused.`
	  );
	  log(`Press ${startkey}Escape${endkey} to exit.`);
  },

  configureDisplay: (termclient) => { // `termclient` is an instance of `TermClient`
    termclient.screen.title = `Discord Terminal Client - ${client.user.tag}`
	  ServerList = contrib.tree({
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

	  MessagesBox = blessed.log({
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

	  EnterMessageBox = blessed.textarea({
	  	top: "86%",
	  	left: "15%",
	  	width: "85.4%",
	  	height: "15%",
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

	  ServerList.on("select", async function (node) {
	  	if (node.myCustomProperty) {
	  		channel_id = node.myCustomProperty;
	  		server_name = node.parent.name;
	  		EnterMessageBox.clearValue();
	  		await termclient.getMessages(node.name, node.myCustomProperty);
	  	}

	  	server_name = " {bold}Server List{/bold} ";
	  	termclient.screen.render();
	  });
	  
    termclient.screen.key(["tab"], function (_ch, _key) {
      if (focused === 0) {
        focused = 1;
	  		EnterMessageBox.focus();
	  		EnterMessageBox.input();
	  		termclient.screen.render();
	  	}
	  });

	  EnterMessageBox.key(["enter"], async function (_ch, _key) {
      let time = utils.convertUnix(Date.now());

      if (termclient.channel_id == null) {
        MessagesBox.log(`${time} {red-fg}{bold}[!]{/bold}{/red-fg} You must select a channel to send a message.`);
      } else {
        let isEmpty = utils.checkIsEmpty(EnterMessageBox.getValue());

        if (isEmpty) MessagesBox.log(`${time} {red-fg}{bold}[!]{/bold}{/red-fg} You cannot send an empty message.`);
        else if (!isEmpty) {
          await termclient.sendMessage(termclient.channel_id, EnterMessageBox.getValue());
        }
      }

		  EnterMessageBox.clearValue();
		  termclient.screen.render();
	  });

  	EnterMessageBox.key(["tab"], function (_ch, _key) {
  		focused = 0;
  		ServerList.focus();
		screen.render();
  	});

  	termclient.screen.key(["escape", "C-c"], function (_ch, _key) {
  		return process.exit(0);
  	});

  	ServerList.focus();

  	termclient.screen.append(ServerList);
  	termclient.screen.append(MessagesBox);
  	termclient.screen.append(EnterMessageBox);
  }
}

// globals
let termclient = new TermClient();

const countdown = new Spinner("Logging in...", ["-", "\\", "|", "/"]);
const startkey = "{black-fg}{white-bg}";
const endkey = "{/black-fg}{/white-bg}";

// functions
async function getMessages(node_name, id) {
	const channel = await client.channels.fetch(id);
	messages = await channel.messages.fetch({ limit: 100 });

	if (channel.type == "DM") {
		ServerList.setLabel(` {bold}DMs{/bold} `);
		MessagesBox.setLabel(` {bold}${node_name}{/bold} `);
	} else {
		ServerList.setLabel(` {bold}${server_name}{/bold} `);
		MessagesBox.setLabel(` {bold}#${channel.name}{/bold} `);
	}

	MessagesBox.setContent("");

	for (const [id, message] of messages.reverse()) {
		try {
			const attatchments = message.attachments.map(
				(attachments) => attachments.url
			);
			let time = utils.convertUnix(message.createdTimestamp);

			if (attatchments.length != 0) {
				if (message.cleanContent.length != 0) {
					MessagesBox.log(
						`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
					);
				} else {
					MessagesBox.log(
						`${time} ${message.author.username}#${message.author.discriminator}: ${attatchments}`
					);
				}
			} else {
				MessagesBox.log(
					`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
				);
			}
		} catch {
			void 0;
		}
	}
}

async function sendMessage(id, message) {
	const channel = await client.channels.fetch(id);
  if (message.startsWith(config.client.prefix)) {
    if (message.startsWith(`${config.client.prefix}help`)) {
      utils.writeHelp(MessagesBox.log);
    }

    if (message.startsWith(`${config.client.prefix}clear`)) {
      MessagesBox.setContent("");
      EnterMessageBox.setContent("");
      screen.render();
    }

    if (message.startsWith(`${config.client.prefix}exit`)) {
      process.exit();
    }
  } else {
    if (channel.type === "DM") {
      channel.send(message);
    } else {
      let channel_sendable = channel
        .permissionsFor(client.user)
        .has("SEND_MESSAGES");

      if (channel_sendable) {
        client.channels.cache.get(id).send(message);
      } else {
        let time = await convertunix(Date.now());
        MessagesBox.log(
          `${time} {red-fg}{bold}[!]{/red-fg}{/bold} You do not have permission to send messages in this channel.`
        );
      }
    }
  }
}


/* <- client gateway events -> */
countdown.start();

client.on("ready", async () => {	
  countdown.stop();
  utils.configureDisplay(termclient);
	utils.writeHelp(MessagesBox.log);
	MessagesBox.log(`\nLogged in as ${startkey}${client.user.tag}${endkey}`);

	screen.render();

	guildnames = client.guilds.cache.map((guild) => guild.name);
	guildids = client.guilds.cache.map((guild) => guild.id);
	let list_dict = { extended: true, children: {} };

	list_dict["children"]["DMs"] = {"children" : {}};
	list_dict["children"]["Servers"] = {"children" : {}};

	for (i in zip([guildnames, guildids])) {
		serverid = guildids[i];
		servername = guildnames[i];

		let guild = await client.guilds.fetch(serverid);
		let channel_names = guild.channels.cache
			.filter((channel) => channel.type === "GUILD_TEXT")
			.map((channel) => channel.name);
		let channel_ids = guild.channels.cache
			.filter((channel) => channel.type === "GUILD_TEXT")
			.map((channel) => channel.id);

		list_dict["children"]["Servers"]["children"][servername] = {"children": {}};

		for (j in zip([channel_names, channel_ids])) {
			const channel = await client.channels.fetch(channel_ids[j]);
			channel_viewable = channel
				.permissionsFor(client.user)
				.has("VIEW_CHANNEL");

			if (channel_viewable) {
				list_dict["children"]["Servers"]["children"][servername]["children"][j + 1] = {
					name: `#${channel_names[j]}`,
					myCustomProperty: channel_ids[j],
				};
			}
		}
	}

	let dm_names = client.channels.cache
		.filter((channel) => channel.type === "DM")
		.map((channel) => channel.recipient.username);
	let dm_ids = client.channels.cache
		.filter((channel) => channel.type === "DM")
		.map((channel) => channel.id);

	let dm_ids_sorted = dm_ids.sort(function (a, b) {
		return dm_names[dm_ids.indexOf(a)].localeCompare(
			dm_names[dm_ids.indexOf(b)]
		);
	});
	let dm_names_sorted = dm_names.sort(function (a, b) {
		return a.localeCompare(b);
	});

	for (i in zip([dm_names_sorted, dm_ids_sorted])) {
		list_dict["children"]["DMs"]["children"][i + 1] = {
			name: dm_names[i],
			myCustomProperty: dm_ids[i],
		};
	}

	ServerList.setData(JSON.parse(JSON.stringify(list_dict)));
	ServerList.focus();
	screen.render();
});

client.on("messageCreate", async (message) => {
	try {
		if (message.channel.id === channel_id) {
			const attatchments = message.attachments.map(
				(attachments) => attachments.url
			);
			let time = await convertunix(message.createdTimestamp);
			if (attatchments.length != 0) {
				if (message.cleanContent.length != 0) {
					MessagesBox.log(
						`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`
					);
				} else {
					MessagesBox.log(
						`${time} ${message.author.username}#${message.author.discriminator}: ${attatchments}`
					);
				}
			} else {
				MessagesBox.log(
					`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`
				);
			}
		}
	} catch {
		void 0;
	}
});


/* <- client startup -> */
fetch("https://discord.com/api/v8/users/@me", {
	method: "GET",
	headers: {
		Authorization: `${config.client.token}`,
	},
})
	.then((res) => res.json())
	.then((json) => {
		if (json.message === "401: Unauthorized") {
			countdown.stop();
			console.log(
				"\033[31m[!]\033[0m Invalid token.\n\nExiting in 5 seconds..."
			);
			setTimeout(() => {
				process.exit(1);
			}, 5000);
		} else {
			client.login(config.client.token);
		}
	});

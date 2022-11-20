/* <- imports -> */
const { Client } = require("discord.js-selfbot-v13");
const client = new Client({ checkUpdate: false });
const ini = require("ini");
const fs = require("fs");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const { Utils } = require("./utils");

/* <- globals, functions -> */
// globals
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
const startkey = "{black-fg}{white-bg}";
const endkey = "{/black-fg}{/white-bg}";

// screen stuff
let screen = blessed.screen({
	smartCSR: true,
	fullUnicode: config.client.unicode === "true",
	dockBorders: true,
	autoPadding: true,
});

screen.key(["escape", "C-c"], function (_ch, _key) {
	return process.exit(0);
});

screen.title = "Discord Terminal Client";

let focused = 0;
channel_id = undefined;

// functions
function prompt(type, text) {
	let time = Utils.convertunix(Date.now());
	prompt_box = blessed.box({
		top: "center",
		left: "center",
		width: "50%",
		height: "50%",
		tags: true,
		border: {
			type: "line",
		},
		style: {
			fg: "white",
			bg: "black",
			border: {
				fg: "#f0f0f0",
			},
		},
	});
	switch (type) {
		case "error":
			prompt_box.setContent(`{red-fg}{bold}${Utils.icon}{/red-fg}{/bold}\n\n${text}`);
			prompt_box.setLabel(` Error `);
			prompt_box.valign = "middle";
			prompt_box.align = "center";
			screen.append(prompt_box);
			screen.render();
			break;

		case "login":
			prompt_box.setContent(`{bold}${Utils.icon}{/bold}\n\n${text}`);
			prompt_box.setLabel(` Startup `);
			prompt_box.valign = "middle";
			prompt_box.align = "center";
			screen.append(prompt_box);
			screen.render();
			break;

		case "small_error":
			MessagesBox.log(`${time} {red-fg}{bold}[!]{/red-fg}{/bold} ${text}`);
			break;

		case "small_success":
			MessagesBox.log(`${time} {green-fg}{bold}[!]{/green-fg}{/bold} ${text}`);
	}
}

async function printHelp() {
	MessagesBox.log(`{bold}Welcome to Discord Terminal!{/bold}

This client was written by paintingofblue & 13-05 using JavaScript. It is still in development, so expect bugs.
If you have downloaded this outside of GitHub, you can find the source code here: https://github.com/paintingofblue/discord-terminal-client

To get started, press ${startkey}Tab${endkey} to switch to the message box, use the ${startkey}Arrow Keys${endkey} to navigate & ${startkey}Enter${endkey} to select items in the list.

Press ${startkey}Tab${endkey} again to switch back to the server list.
Press ${startkey}Enter${endkey} to send a message when the message box is focused.
Press ${startkey}Escape${endkey} to exit.

{bold}Commands:{/bold}
{bold}${config.client.prefix}help{/bold} - Show this help message.
{bold}${config.client.prefix}clear{/bold} - Clear the message box.
{bold}${config.client.prefix}exit{/bold} - Exit the client.`);
}

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

	for (const [, message] of messages.reverse()) {
		try {
			const attachments = message.attachments.map((attachments) => attachments.url);
			let time = Utils.convertunix(message.createdTimestamp);

			if (attachments.length > 0) {
				if (message.cleanContent.length > 0) {
					MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attachments}`);
				} else {
					MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${attachments}`);
				}
			} else {
				MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
			}
		} catch {
			void 0;
		}
	}
}

async function sendMessage(id, message) {
	const channel = await client.channels.fetch(id);

	if (message.startsWith(config.client.prefix)) {
		let command = message
			.split(config.client.prefix)[1]
			.split(" ")[0]
			.replace("\n", "");

		// command handler
		switch (command) {
			case "help":
				printHelp();
				break;

			case "clear":
				MessagesBox.setContent("");
				EnterMessageBox.setContent("");
				screen.render();
				break;

			case "exit":
				process.exit(0);

			default:
				prompt("small_error", "You do not have permission to send messages in this channel.");
		}
	} else {
		if (channel.type.includes("DM")) {
			channel.send(message);
		} else {
			let channel_sendable = channel.permissionsFor(client.user).has("SEND_MESSAGES");

			if (channel_sendable) {
				channel.send(message);
			} else {
				prompt("small_error", "You do not have permission to send messages in this channel.");
			}
		}
	}
}

function configure_display() {
	screen.title = `Discord Terminal Client - ${client.user.tag}`;
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
		width: "85%",
		height: "85%",
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
		top: "85%",
		left: "15%",
		width: "85%",
		height: "17%",
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
			await getMessages(node.name, node.myCustomProperty);
		}

		server_name = " {bold}Server List{/bold} ";
		screen.render();
	});

	EnterMessageBox.key(["enter"], async function (_ch, _key) {
		if (channel_id != undefined) {
			let message = Utils.checkIfEmpty(EnterMessageBox.getValue());
			if (message) {
				prompt("small_error", "You cannot send an empty message.");
			} else {
				await sendMessage(channel_id, EnterMessageBox.getValue());
			}
		} else {
			prompt("small_error", "You must select a channel to send a message.");
		}

		EnterMessageBox.clearValue();
		screen.render();
	});

	EnterMessageBox.key(["tab"], function (_ch, _key) {
		focused = 0;
		ServerList.focus();
		screen.render();
	});

	screen.key(["tab"], function (_ch, _key) {
		if (focused === 0) {
			focused = 1;
			EnterMessageBox.focus();
			EnterMessageBox.input();
			screen.render();
		}
	});

	ServerList.focus();
	screen.append(ServerList);
	screen.append(MessagesBox);
	screen.append(EnterMessageBox);
}

/* <- client gateway events -> */
client.on("ready", async () => {
	configure_display();
	MessagesBox.log(`{center}${Utils.icon}{/center}`);
	await printHelp();
	screen.render();

	let ServerList_data = {
		extended: true,
		children: {
			DMs: {
				children: {},
			},
			Servers: {
				children: {},
			},
		},
	};

	// mapping servers
	guildnames = client.guilds.cache.map((guild) => guild.name);
	guildids = client.guilds.cache.map((guild) => guild.id);

	for (i in Utils.zip([guildnames, guildids])) {
		let guild = await client.guilds.fetch(guildids[i]);
		let channel_names = guild.channels.cache
			.filter((channel) => channel.type === "GUILD_TEXT")
			.map((channel) => channel.name);
		let channel_ids = guild.channels.cache
			.filter((channel) => channel.type === "GUILD_TEXT")
			.map((channel) => channel.id);

		ServerList_data["children"]["Servers"]["children"][guildnames[i]] = { children: {}, };

		// setting channels
		for (j in Utils.zip([channel_names, channel_ids])) {
			const channel = await client.channels.fetch(channel_ids[j]);
			channel_viewable = channel.permissionsFor(client.user).has("VIEW_CHANNEL");

			if (channel_viewable) {
				ServerList_data["children"]["Servers"]["children"][guildnames[i]]["children"][j] = {
					name: `#${channel_names[j]}`,
					myCustomProperty: channel_ids[j],
				};
			}
		}
	}

	// mapping dms & sorting them
	let dms = client.channels.cache.map((channel) => {
		if (channel.type === "DM") {
			return {
				name: channel.recipient ? channel.recipient.username : null,
				id: channel.id,
				type: channel.type,
				position: channel.lastMessageId,
			};
		} else if (channel.type === "GROUP_DM") {
			if (channel.name != null) {
				return {
					name: channel.name,
					id: channel.id,
					type: channel.type,
					position: channel.lastMessageId,
				};
			} else {
				return {
					name: channel.recipients.map((user) => user.username).join(", "),
					id: channel.id,
					type: channel.type,
					position: channel.lastMessageId,
				};
			}
		}
	}).sort((a, b) => b.position - a.position);

	/* temp way to assign it to the list */
	for (i in dms) {
		if (dms[i] != undefined) {
			ServerList_data["children"]["DMs"]["children"][i] = {
				name: dms[i].name,
				myCustomProperty: dms[i].id,
			};
		}
	}

	/* setting ServerList_data to the ServerList element */
	ServerList.setData(JSON.parse(JSON.stringify(ServerList_data))); // blessed is weird so we have stringify it, then parse it, since it doesn't work with quotes
	ServerList.focus();
	screen.render();
});

client.on("messageCreate", async (message) => {
	// if the message is in the current channel, then log it to the MessagesBox
	if (message.channel.id === channel_id) {
		let attachments = message.attachments.map((attachments) => attachments.url);
		let time = Utils.convertunix(message.createdTimestamp);

		if (attachments.length > 0) {
			if (message.cleanContent.length > 0) {
				MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attachments}`);
			} else {
				MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${attachments}`);
			}
		} else {
			MessagesBox.log(`${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
		}
	}
});

/* <- client startup -> */
prompt("login", "Logging in...");
client.login(config.client.token).catch(() => {
	prompt("error", "Failed to login.\nExiting in 5 seconds...");
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});
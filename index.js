/* <- Imports -> */
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const ini = require('ini');
const fs = require('fs');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { Utils } = require('./utils');

/* <- Globals -> */
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
const startKey = '{black-fg}{white-bg}';
const endKey = '{/black-fg}{/white-bg}';

let screen = blessed.screen({
	smartCSR: true,
	fullUnicode: config.client.unicode === 'true',
	dockBorders: true,
	autoPadding: false,
	title: 'Nyx'
});

screen.key(['escape', 'C-c'], async function (_ch, _key) {
	return process.exit(0);
});

let focused = 0;
channelID = undefined;

/* <-- Functions --> */
async function printHelp() {
	messagesBox.log(`{bold}Welcome to Nyx!{/bold}

This client was written by paintingofblue & 13-05 using JavaScript. It is still in development, so expect bugs.
If you have downloaded this outside of GitHub, you can find the source code here: https://github.com/paintingofblue/discord-terminal-client

To get started, press ${startKey}Tab${endKey} to switch to the message box, use the ${startKey}Arrow Keys${endKey} to navigate & ${startKey}Enter${endKey} to select items in the list.

Press ${startKey}Tab${endKey} again to switch back to the server list.
Press ${startKey}Enter${endKey} to send a message when the message box is focused.
Press ${startKey}Escape${endKey} to exit.

{bold}Commands:{/bold}
{bold}${config.client.prefix}help{/bold} - Show this help message.
{bold}${config.client.prefix}clear{/bold} - Clear the message box.
{bold}${config.client.prefix}exit{/bold} - Exit the client.`);
}

async function getMessages(node_name, id) {
	let channel = await client.channels.fetch(id);
	let messages = await channel.messages.fetch({ limit: 100 });

	if (channel.type.includes('DM')) {
		serverList.setLabel(` {bold}DMs{/bold} `);
		messagesBox.setLabel(` {bold}${node_name}{/bold} `);
	} else {
		serverList.setLabel(` {bold}${serverName}{/bold} `);
		messagesBox.setLabel(` {bold}#${channel.name}{/bold} `);
	}

	messagesBox.setContent('');

	for (let [, message] of messages.reverse()) {
		try {
			logMessage(message)
		} catch {
			void 0;
		}
	}
}

async function sendMessage(id, message) {
	let channel = await client.channels.fetch(id);

	if (message.startsWith(config.client.prefix)) {
		let command = message
			.split(config.client.prefix)[1]
			.split(' ')[0]
			.replace('\n', '');

		// Command handler
		switch (command) {
			case 'help':
				printHelp();
				break;

			case 'clear':
				messagesBox.setContent('');
				enterMessageBox.setContent('');
				screen.render();
				break;

			case 'exit':
				process.exit(0);

			default:
				prompt('small_error', `That command does not exist. Run ${config.client.prefix}help for a list of commands.`);
		}
	} else {
		if (channel.type.includes('DM')) {
			channel.send(message);
		} else {
			let channel_sendable = channel.permissionsFor(client.user).has('SEND_MESSAGES');

			if (channel_sendable) {
				channel.send(message);
			} else {
				prompt('small_error', 'You do not have permission to send messages in this channel.');
			}
		}
	}
}

function configure_display() {
	screen.title = `Nyx - ${client.user.tag}`;
	serverList = contrib.tree({
		top: 'top',
		left: 'left',
		width: '15%',
		height: '100%',
		label: ' {bold}Server List{/bold} ',
		tags: true,
		border: {
			type: 'line',
		},
		style: {
			fg: 'white',
			border: {
				fg: 'white',
			},
			selected: {
				fg: 'black',
				bg: 'white',
			},
		},
	});

	messagesBox = blessed.log({
		left: '15%',
		width: '85%',
		height: '85%',
		tags: true,
		border: {
			type: 'line',
		},
		style: {
			fg: 'white',
			border: {
				fg: 'white',
			},
		},
	});

	enterMessageBox = blessed.textarea({
		top: '85%',
		left: '15%',
		width: '85%',
		height: '17%',
		tags: true,
		border: {
			type: 'line',
			fg: 'white',
		},
		label: ' {bold}Enter Message{/bold} ',
		style: {
			fg: 'white',
			focused: {
				fg: 'green',
			},
		},

	});

	serverList.on('select', async function (node) {
		if (node.myCustomProperty) {
			channelID = node.myCustomProperty;
			serverName = node.parent.name;
			enterMessageBox.clearValue();
			await getMessages(node.name, node.myCustomProperty);
		}

		serverName = ' {bold}Server List{/bold} ';
		screen.render();
	});

	enterMessageBox.key(['enter'], async function (_ch, _key) {
		if (channelID != undefined) {
			let message = Utils.checkIfEmpty(enterMessageBox.getValue());
			if (message) {
				prompt('small_error', 'You cannot send an empty message.');
			} else {
				await sendMessage(channelID, enterMessageBox.getValue());
			}
		} else {
			prompt('small_error', 'You must select a channel to send a message.');
		}

		enterMessageBox.clearValue();
		screen.render();
	});

	enterMessageBox.key(['tab'], function (_ch, _key) {
		focused = 0;
		serverList.focus();
		screen.render();
	});

	screen.key(['tab'], function (_ch, _key) {
		if (focused === 0) {
			focused = 1;
			enterMessageBox.focus();
			enterMessageBox.input();
			screen.render();
		}
	});

	serverList.focus();
	screen.append(serverList);
	screen.append(messagesBox);
	screen.append(enterMessageBox);
}

function logMessage(message) {
	let attachments = message.attachments.map((attachments) => attachments.url);
	let time = Utils.date(message.createdTimestamp);
	let user = ''
	if (!message.channel.type.includes('DM')) {
		if (message.member.nickname) {
			user = `${message.member.nickname} (${message.author.tag})`
		} else {
			user = message.author.tag;
		}
	} else {
		user = message.author.tag;
	}

	if (attachments.length > 0) {
		if (message.cleanContent.length > 0) {
			messagesBox.log(`${time} ${user}: ${message.cleanContent}\n${attachments}`);
		} else {
			messagesBox.log(`${time} ${user}: ${attachments}`);
		}
	} else {
		messagesBox.log(`${time} ${user}: ${message.cleanContent}`);
	}
}

function prompt(type, text) {
	let time = Utils.date(Date.now());
	prompt_box = blessed.box({
		top: 'center',
		left: 'center',
		width: '50%',
		height: '50%',
		tags: true,
		border: {
			type: 'line',
		},
		style: {
			fg: 'white',
			border: {
				fg: '#f0f0f0',
			},
		},
	});
	switch (type) {
		case 'error':
			prompt_box.setContent(`{red-fg}{bold}${Utils.icon}{/red-fg}{/bold}\n\n${text}`);
			prompt_box.setLabel(` Error `);
			prompt_box.valign = 'middle';
			prompt_box.align = 'center';
			screen.append(prompt_box);
			screen.render();
			break;

		case 'login':
			prompt_box.setContent(`{bold}${Utils.icon}{/bold}\n\n${text}`);
			prompt_box.setLabel(` Nyx `);
			prompt_box.valign = 'middle';
			prompt_box.align = 'center';
			screen.append(prompt_box);
			screen.render();
			break;

		case 'small_error':
			messagesBox.log(`${time} {red-fg}{bold}[!]{/red-fg}{/bold} ${text}`);
			messagesBox.log(`${time} {italic}hi{/italic}`)
			break;

		case 'small_success':
			messagesBox.log(`${time} {green-fg}{bold}[!]{/green-fg}{/bold} ${text}`);
			break;
	}
}

/* <- Client events -> */
client.on('ready', async () => {
	configure_display();
	messagesBox.log(`{center}${Utils.icon}{/center}`);
	await printHelp();

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
	let guildnames = client.guilds.cache.map((guild) => guild.name);
	let guildids = client.guilds.cache.map((guild) => guild.id);

	for (i in Utils.zip([guildnames, guildids])) {
		let guild = await client.guilds.fetch(guildids[i]);
		let channel_names = guild.channels.cache
			.filter((channel) => channel.type === 'GUILD_TEXT')
			.map((channel) => channel.name);
		let channel_ids = guild.channels.cache
			.filter((channel) => channel.type === 'GUILD_TEXT')
			.map((channel) => channel.id);

		ServerList_data['children']['Servers']['children'][guildnames[i]] = { children: {}, };

		// setting channels
		for (j in Utils.zip([channel_names, channel_ids])) {
			let channel = await client.channels.fetch(channel_ids[j]);
			channel_viewable = channel.permissionsFor(client.user).has('VIEW_CHANNEL');

			if (channel_viewable) {
				ServerList_data['children']['Servers']['children'][guildnames[i]]['children'][j] = {
					name: `#${channel_names[j]}`,
					myCustomProperty: channel_ids[j],
				};
			}
		}
	}

	// Assigning dms and sorting them from their last message id
	let dms = client.channels.cache.map((channel) => {
		if (channel.type === 'DM') {
			return {
				name: channel.recipient ? channel.recipient.username : null,
				id: channel.id,
				type: channel.type,
				position: channel.lastMessageId,
			};
		} else if (channel.type === 'GROUP_DM') {
			if (channel.name != null) {
				return {
					name: channel.name,
					id: channel.id,
					type: channel.type,
					position: channel.lastMessageId,
				};
			} else {
				return {
					name: channel.recipients.map((user) => user.username).join(', '),
					id: channel.id,
					type: channel.type,
					position: channel.lastMessageId,
				};
			}
		}
	}).sort((a, b) => b.position - a.position);

	/* Temp way to assign it to the list */
	for (i in dms) {
		if (dms[i] != undefined) {
			ServerList_data['children']['DMs']['children'][i] = {
				name: dms[i].name,
				myCustomProperty: dms[i].id,
			};
		}
	}

	/* Assigning data to serverlist */
	serverList.setData(ServerList_data);
	serverList.focus();
	screen.render();
});

client.on('messageCreate', async (message) => {
	/* Log message if it's in the selected channel */
	if (message.channel.id === channelID) {
		logMessage(message);
	}
});

/* <- Startup -> */
prompt('login', 'Logging in...');
client.login(config.client.token).catch(() => {
	prompt('error', 'Failed to login.\nExiting in 5 seconds...');
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});
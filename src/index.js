const { Utils } = require('./utils');
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const ini = require('ini');
const fs = require('fs');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

// Other non-import constants/vars
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
const startKey = '{black-fg}{white-bg}';
const endKey = '{/black-fg}{/white-bg}';
let focused = 0;
let channelID;

// Initializing the actual UI where stuff is rendered on
const screen = blessed.screen({
	smartCSR: true,
	fullUnicode: config.client.unicode === 'true',
	dockBorders: true,
	autoPadding: false,
	title: 'Nyx',
});

screen.key(['escape', 'C-c'], async function (_ch, _key) {
	return process.exit(0);
});

/* <-- Functions --> */
function printHelp() {
	messagesBox.log(`{bold}Welcome to Nyx!{/bold}

This is a WIP terminal client for Discord, written in nodejs by paintingofblue and 13-05.
If you have downloaded this outside of GitHub, you can find the source code here: https://github.com/paintingofblue/Nyx

To get started, press ${startKey}Tab${endKey} to switch to the message box, use the ${startKey}Arrow Keys${endKey} to navigate & ${startKey}Enter${endKey} to select items in the list.

Press ${startKey}Tab${endKey} again to switch back to the server list.
Press ${startKey}Enter${endKey} to send a message when the message box is focused.
Press ${startKey}Escape${endKey} to exit.

{bold}Commands:{/bold}
{bold}${config.client.prefix}help{/bold} - Show this help message.
{bold}${config.client.prefix}clear{/bold} - Clear the message box.
{bold}${config.client.prefix}exit{/bold} - Exit the client.`);
}

function logMessage(message) {
	const attachments = message.attachments.map((attachments) => attachments.url.replace(/\?(?:\w+=\w+&)*(?:ex|hm)=[^&]+&?/g, ' '));
	const time = Utils.date(message.createdTimestamp);
	const msgContent = Utils.parseMsg(message.cleanContent);
	let user;
	if (message.channel.type.includes('DM')) {
		user = message.author.tag;
	} else if (message.member?.nickname) {
		user = `${message.member.nickname} (${message.author.tag})`;
	} else {
		user = message.author.tag;
	}

	if (attachments.length > 0) {
		if (msgContent.length > 0) {
			messagesBox.log(`${time} ${user}: ${msgContent}\n${attachments}`);
		} else {
			messagesBox.log(`${time} ${user}: ${attachments}`);
		}
	} else {
		messagesBox.log(`${time} ${user}: ${msgContent}`);
	}
}

async function getMessages(serverName, id) {
	const channel = await client.channels.fetch(id);
	const messages = await channel.messages.fetch({ limit: 100 });

	if (channel.type.includes('DM')) {
		serverList.setLabel(' {bold}DMs{/bold} ');
		messagesBox.setLabel(` {bold}${serverName}{/bold} `);
	} else {
		serverList.setLabel(` {bold}${serverName}{/bold} `);
		messagesBox.setLabel(` {bold}#${channel.name}{/bold} `);
	}

	messagesBox.setContent('');

	for (let [, message] of messages.reverse()) {
		try {
			logMessage(message);
		} catch (e) {
			// Messages may not show, and this is why. Just to prevent client from stopping.
		}
	}
}

async function sendMessage(id, message) {
	const channel = await client.channels.fetch(id);

	if (message.startsWith(config.client.prefix)) {
		const command = message.split(config.client.prefix)[1].split(' ')[0].replace('\n', '');

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

		// eslint cries about the above code not knowing it's unreachable lol
		// eslint-disable-next-line no-fallthrough
		default:
			prompt('smallError', `That command does not exist. Run ${config.client.prefix}help for a list of commands.`);
		}
	} else if (channel.type.includes('DM')) {
		channel.send(message);
	} else {
		const channelSendable = channel.permissionsFor(client.user).has('SEND_MESSAGES');

		if (channelSendable) {
			channel.send(message);
		} else {
			prompt('smallError', 'You do not have permission to send messages in this channel.');
		}
	}
}

function configureDisplay() {
	screen.title = `Nyx - ${client.user.tag}`;
	global.serverList = contrib.tree({
		top: 'top',
		left: 'left',
		width: '15%',
		height: '100%',
		label: ' {bold}Server List{/bold} ',
		tags: true,
		treePrefix: '',
		template: {
			lines: false,
			extend: '',
			retract: '',
		},
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

	global.messagesBox = blessed.log({
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

	global.enterMessageBox = blessed.textarea({
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
		let serverName;
		if (node.id) {
			channelID = node.id;
			serverName = node.parent.name;
			enterMessageBox.clearValue();
			await getMessages(serverName, channelID);
		}

		serverName = ' {bold}Server List{/bold} ';
		screen.render();
	});

	enterMessageBox.key(['enter'], async function (_ch, _key) {
		if (channelID == undefined) {
			prompt('smallError', 'You must select a channel to send a message.');
		} else {
			const empty = Utils.checkIfEmpty(enterMessageBox.getValue());
			if (empty) {
				prompt('smallError', 'You cannot send an empty message.');
			} else {
				await sendMessage(channelID, enterMessageBox.getValue());
			}
		}

		enterMessageBox.clearValue();
		screen.render();
	});

	enterMessageBox.key(['tab'], (_ch, _key) => {
		focused = 0;
		serverList.focus();
		screen.render();
	});

	screen.key(['tab'], (_ch, _key) => {
		if (focused !== 0) {
			return;
		}
		focused = 1;
		enterMessageBox.focus();
		enterMessageBox.input();
		screen.render();
	});

	serverList.focus();
	screen.append(serverList);
	screen.append(messagesBox);
	screen.append(enterMessageBox);
}

function prompt(type, text) {
	const time = Utils.date(Date.now());

	const promptBox = blessed.box({
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
		promptBox.setContent(`{red-fg}{bold}${Utils.icon}{/red-fg}{/bold}\n\n${text}`);
		promptBox.setLabel(' Error ');
		promptBox.valign = 'middle';
		promptBox.align = 'center';
		screen.append(promptBox);
		screen.render();
		break;

	case 'login':
		promptBox.setContent(`{bold}${Utils.icon}{/bold}\n\n${text}`);
		promptBox.setLabel(' Nyx ');
		promptBox.valign = 'middle';
		promptBox.align = 'center';
		screen.append(promptBox);
		screen.render();
		break;

	case 'smallError':
		messagesBox.log(`${time} {red-fg}{bold}[!]{/red-fg}{/bold} ${text}`);
		messagesBox.log(`${time} {italic}hi{/italic}`);
		break;

	case 'smallSuccess':
		messagesBox.log(`${time} {green-fg}{bold}[!]{/green-fg}{/bold} ${text}`);
		break;
	}
}

/* <-- Client events --> */
client.on('ready', async () => {
	configureDisplay();
	messagesBox.log(`{center}${Utils.icon}{/center}`);
	printHelp();

	const serverListData = {
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

	// Assigning DMs
	const dms = client.channels.cache
		.map((channel) => {
			if (channel.type === 'DM') {
				return {
					name: channel.recipient ? channel.recipient.username : null,
					id: channel.id,
					type: channel.type,
					position: channel.lastMessageId,
				};
			} else if (channel.type === 'GROUP_DM') {
				return channel.name == null
					? {
						name: channel.recipients.map((user) => user.username).join(', '),
						id: channel.id,
						type: channel.type,
						position: channel.lastMessageId,
					}
					: {
						name: channel.name,
						id: channel.id,
						type: channel.type,
						position: channel.lastMessageId,
					};
			}
		})
		.sort((a, b) => b.position - a.position)
		.forEach((dm) => {
			if (!dm) return;

			serverListData.children.DMs.children[dm.id] = {
				name: dm.name,
				id: dm.id,
			};
		});

	// Assigning servers
	client.settings.guildFolder.cache.forEach((folder) => {
		if (folder.name == null) {
			const guild = client.guilds.cache.get(folder.guild_ids[0]);

			serverListData.children.Servers.children[guild.name] = {
				extended: false,
				children: {},
			};

			guild.channels.cache
				.filter((channel) => channel.type == 'GUILD_TEXT')
				.forEach((channel) => {
					if (channel.permissionsFor(client.user).has('VIEW_CHANNEL')) {
						serverListData.children.Servers.children[guild.name].children[channel.name] = {
							id: channel.id,
						};
					}
				});
			return;
		}
		serverListData.children.Servers.children[folder.name] = {
			extended: false,
			children: {},
		};

		folder.guild_ids.forEach((id) => {
			const guild = client.guilds.cache.get(id);

			serverListData.children.Servers.children[folder.name].children[guild.name] = {
				extended: false,
				children: {},
			};

			guild.channels.cache
				.filter((channel) => channel.type == 'GUILD_TEXT')
				.forEach((channel) => {
					if (channel.permissionsFor(client.user).has('VIEW_CHANNEL')) {
						serverListData.children.Servers.children[folder.name].children[guild.name].children[channel.name] = {
							id: channel.id,
						};
					}
				});
		});
	});

	/* Assigning data to serverlist */
	serverList.setData(serverListData);
	serverList.focus();
	screen.render();
});

client.on('messageCreate', async (message) => {
	if (message.channel.id === channelID) {
		/* Log message if it's in the selected channel */
		logMessage(message);
	}
});

/* <-- Startup --> */
prompt('login', 'Logging in...');
client.login(config.client.token).catch(() => {
	prompt('error', 'Failed to login.\nExiting in 5 seconds...');
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});

/* eslint-disable no-empty */
const { marked } = require('marked');
const { markedTerminal } = require('marked-terminal');
const ini = require('ini');
const fs = require('fs');
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

marked.use(markedTerminal());

const Utils = {
	zip(rows) {
		return rows[0].map((_, c) => rows.map((row) => row[c]));
	},

	checkIfEmpty(str) {
		return str.trim() === '';
	},

	date(unix) {
		const date = new Date(unix);
		const hour = date.getHours().toString().padStart(2, '0');
		const minute = date.getMinutes().toString().padStart(2, '0');
		const second = date.getSeconds().toString().padStart(2, '0');

		return `${hour}:${minute}:${second}`;
	},

	parseMsg(text) {
		// Discord telemetry on links for whatever reason
		text = text.replace(/\?(?:\w+=\w+&)*(?:ex|hm)=[^&]+&?/g, ' ');

		// Markdown parsing
		try {
			text = marked(text);
		} catch { }


		// Remove annoying newlines
		return this.removeLastInstance(text, '\n\n');
	},

	removeLastInstance(badText, str) {
		const lastIndex = badText.lastIndexOf(str);

		if (lastIndex === -1) {
			return badText; // If the text is not found, return the original string
		}

		const before = badText.slice(0, lastIndex);
		const after = badText.slice(lastIndex + str.length);
		return before + after;
	},

	icon: `______________
|              |
|  \\           |
|   \\          |
|   /          |
|  /  _______  |
|              |
‾‾‾‾‾‾‾‾‾‾‾‾‾‾`,
};

module.exports = {
	Utils,
};

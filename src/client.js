// <-- Imports -->
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

const ini = require('ini');
const config = ini.parse(fs.readFileSync(path.join(__dirname, '../config.ini'), 'utf-8'));

const blessed = require('blessed');
const contrib = require('blessed-contrib');


// <-- Classes -->
class TerminalClient {
    constructor() {
        this.client = new Client({checkUpdate: false});
        this.utils = new Utils();

        this.configureScreen();
        this.login();
    }

    // UI things
    configureScreen() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'Nyx'
        });

        this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });
    }

    logMessage(message) {
        void 0;
    }

    prompt(type, message) {
        void 0;
    }

    // Client events (Call this after configureScreen, since it uses screen elements)


    // Handle logging in to Discord & preparing the client
    login() {
        let token =  process.env["NYX-TOKEN"] || config.token;
        this.client.login(token);
    }
}


class Logger {
    constructor() {
        this.red = '\x1b[31m';
        this.green = '\x1b[32m';
        this.yellow = '\x1b[33m';
        this.bold = '\x1b[1m';
        this.reset = '\x1b[0m';
    }
}

class Utils {
    constructor() {
        this.icon = `______________
        |              |
        |  \\           |
        |   \\          |
        |   /          |
        |  /  _______  |
        |              |
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾`;
    }

    zip(rows) {
        return rows[0].map((_, c) => rows.map((row) => row[c]));
    }

    checkIfEmpty(str) {
        return str.trim() === '';
    }

    convertDate(unix) {
        let date = new Date(unix);
        let hour = date.getHours().toString().padStart(2, '0');
        let minute = date.getMinutes().toString().padStart(2, '0');
        let second = date.getSeconds().toString().padStart(2, '0');

        return `${hour}:${minute}:${second}`;
    }
}


// <-- Exports -->
module.exports = {
    TerminalClient,
    Logger,
    Utils
}
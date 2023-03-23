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
        this.utils = new Utils();
        this.client = new Client({checkUpdate: false});

        this.configureScreen();
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

        this.grid = new contrib.grid({rows: 12, cols: 12, screen: this.screen});
    }

    logMessage(message) {
        void 0;
    }

    prompt(type, message) {
        let time = this.utils.convertDate(Date.now());

        let promptBox = blessed.box({
            top: 'center',
            left: 'center',
            width: '50%',
            height: '50%',
            tags: true,
            valign: 'middle',
            align: 'center',
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
            case 'login':
                promptBox.setLabel(' Login ')
                promptBox.setContent(`{bold}${this.utils.icon}{/bold}\n\n{bold}${message}{/bold}`);
                this.screen.append(promptBox);
                this.screen.render();
                break;

            case 'large_error':
                promptBox.setLabel(' Error ')
                promptBox.setContent(`${this.utils.colors.red}{bold}${this.utils.icon}{/bold}${this.utils.colors.reset}\n\n{bold}${message}{/bold}`);
                this.screen.append(promptBox);
                this.screen.render();
                break;

            case 'small_error':
                void 0;
                break;
            case 'small_success':
                void 0;
                break;
        }
    }

    // Client events (Call this after configureScreen, since it uses screen elements)

    // Handle logging in to Discord & preparing the client
    login() {
        let token =  process.env["NYX-TOKEN"] || config.client.token;

        this.prompt('login', 'Logging in...');

        this.client.login(token)
            .catch((_err) => {
                this.prompt('large_error', 'Invalid token. Exiting in 5 seconds...');

                setTimeout(() => {
                    process.exit(0);
                }, 5000);
        });
    }
}

class Utils {
    constructor() {
        this.colors = {
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            bold: '\x1b[1m',
            reset: '\x1b[0m',
        }

        this.icon = ` ______________
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
    Utils
}
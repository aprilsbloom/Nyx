// <-- Imports -->
const blessed = require('blessed');
const contrib = require('blessed-contrib');


// <-- Classes -->
class TerminalClient {
    constructor() {
        this.log = new Logger();
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

    // Handle logging in to Discord
    login() {
        console.log("login");
    } catch (e) {
        this.log.error(e);
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

    error(message) {
        console.log(`${this.red}[-]${this.reset} - ${message}`);
    }

    success(message) {
        console.log(`${this.green}[+]${this.reset} - ${message}`);
    }

    warning(message) {
        console.log(`${this.yellow}[!]${this.reset} - ${message}`);
    }

    info(message) {
        console.log(`${this.bold}[-]${this.reset} - ${message}`);
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

    date(unix) {
        let date = new Date(unix);
        let hour = date.getHours().toString().padStart(2, '0');
        let minute = date.getMinutes().toString().padStart(2, '0');
        let second = date.getSeconds().toString().padStart(2, '0');

        return `${hour}:${minute}:${second}`;
    }
}


// <-- Constants -->
const utils = new Utils();


// <-- Exports -->
module.exports = {
    TerminalClient,
    Logger,
    Utils
}
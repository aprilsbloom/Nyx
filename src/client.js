/* eslint-disable no-unused-vars */
/* <-- Imports --> */
const { Client } = require("discord.js-selfbot-v13")
const fs = require("fs")
const path = require("path")
const ini = require("ini")

const blessed = require("blessed")
const contrib = require("blessed-contrib")

/* <-- Variables --> */
// Setting up the config
const config = {
    client: {
        token: "",
        prefix: "t!",
        unicode: true
    }
}

if (process.env["NYX-TOKEN"]) config.client.token = process.env["NYX-TOKEN"]
if (process.env["NYX-PREFIX"]) config.client.prefix = process.env["NYX-PREFIX"]
if (process.env["NYX-UNICODE"]) config.client.unicode = process.env["NYX-UNICODE"]

/* <-- Classes --> */
/**
 * The main class for the terminal client.
 */
class TerminalClient {
    constructor () {
        this.utils = new Utils()
        this.client = new Client({ checkUpdate: false })

        this.configureScreen()
    }

    /**
     * Configures the screen. This creates all elements necessary for the client to function as intended.
     */
    configureScreen () {
        this.screen = blessed.screen({
            smartCSR: true,
            title: "Nyx"
        })

        this.screen.key(["escape", "q", "C-c"], function (ch, key) {
            return process.exit(1)
        })
    }

    /**
     * Logs a message to the message box.
     *
     * @param {string} message - The message to log
     */
    logMessage (message) {
        console.log(message)
    }

    /**
     * Displays a prompt to the user.
     *
     * @param {string} type - The type of prompt to display
     * @param {string} message - The message to display in the prompt
     */
    prompt (type, message) {
        const time = this.utils.convertDate(Date.now())

        const promptBox = blessed.box({
            top: "center",
            left: "center",
            width: "50%",
            height: "50%",
            tags: true,
            valign: "middle",
            align: "center",
            border: {
                type: "line"
            },
            style: {
                fg: "white",
                border: {
                    fg: "#f0f0f0"
                }
            }
        })

        switch (type) {
        case "login":
            promptBox.setLabel(" Login ")
            promptBox.setContent(`{bold}${this.utils.icon}{/bold}\n\n{bold}${message}{/bold}`)
            this.screen.append(promptBox)
            this.screen.render()
            break

        case "large_error":
            promptBox.setLabel(" Error ")
            promptBox.setContent(`${this.utils.colors.red}{bold}${this.utils.icon}{/bold}${this.utils.colors.reset}\n\n{bold}${message}{/bold}`)
            this.screen.append(promptBox)
            this.screen.render()
            break

        case "small_error":
            console.log("todo")
            break
        case "small_success":
            console.log("todo")
            break
        }
    }

    // Handle logging in to Discord & preparing the client
    login () {
        const token = config.client.token
        this.prompt("login", "Logging in...")

        this.client.login(token)
            .catch((_err) => {
                this.prompt("large_error", "Invalid token. Exiting in 5 seconds...")

                setTimeout(() => {
                    process.exit(0)
                }, 5000)
            })
    }
}

/**
 * A class containing utility functions.
*/
class Utils {
    constructor () {
        this.colors = {
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            bold: "\x1b[1m",
            reset: "\x1b[0m"
        }

        this.icon = ` ______________
|              |
|  \\           |
|   \\          |
|   /          |
|  /  _______  |
|              |
 ‾‾‾‾‾‾‾‾‾‾‾‾‾‾`
    }

    /**
     * Transposes a 2D array.
     *
     * @param {Array} rows - The 2D array to transpose
     * @returns {Array} The transposed array
     * @example
     * let arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
     * let transposed = this.transpose(arr);
     * // transposed = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
    */
    zip (rows) {
        return rows[0].map((_, c) => rows.map((row) => row[c]))
    }

    /**
     * Fetches the config file.
     *
     * @returns {Object} An object containing the content of config.json
    */
    fetchConfig () {
        const configPath = path.join(__dirname, "../config.json")
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

        return config
    }

    /**
     * Checks if a string is empty.
     *
     * @param {string} str - The string to check
     * @returns {boolean} Whether or not the string is empty
    */
    checkIfEmpty (str) {
        return str.trim() === ""
    }

    /**
     * Converts a unix timestamp to the format HH:MM:SS.
     *
     * @param {number} unix - The unix timestamp to convert
     * @returns {string} The converted timestamp
     * @example
     * let unix = 1620000000;
     * let converted = this.convertDate(unix);
     * // converted = 22:13:20
    */
    convertDate (unix) {
        const date = new Date(unix)
        const hour = date.getHours().toString().padStart(2, "0")
        const minute = date.getMinutes().toString().padStart(2, "0")
        const second = date.getSeconds().toString().padStart(2, "0")

        return `${hour}:${minute}:${second}`
    }
}

/* <-- Exports --> */
module.exports = {
    TerminalClient,
    Utils
}

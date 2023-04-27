/* eslint-disable no-unused-vars */
/* <-- Imports --> */
const { Client } = require("discord.js-selfbot-v13")
const { Utils } = require("./utils")
const { Ui } = require("./ui")
const fs = require("fs")
const path = require("path")
const blessed = require("blessed")
const contrib = require("blessed-contrib")

const utils = new Utils()
const config = Object.assign(utils.configSkeleton, utils.fetchConfig())
fs.writeFileSync(path.join(__dirname, "../config.json"), JSON.stringify(config, null, 4))

/* <-- Classes --> */
/**
 * The main class for the terminal client.
 */
class TerminalClient {
    constructor () {
        this.client = new Client({ checkUpdate: false })
        this.ui = new Ui(this.client, utils, config)
    }

    /**
     * Logs a message to the message box.
     *
     * @param {string} message - The message to log
     */
    logMessage (message) {
        console.log(message)
    }

    // Handle logging in to Discord & preparing the client
    login () {
        const token = config.token
        this.ui.prompt("login", "Logging in...")

        this.client.login(token).catch((_err) => {
            this.ui.prompt("large_error", `Error: ${_err.message}\nExiting in 5 seconds...`)

            setTimeout(() => {
                process.exit(0)
            }, 5000)
        })
    }
}

/* <-- Exports --> */
module.exports = {
    TerminalClient
}

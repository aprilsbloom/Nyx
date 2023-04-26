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
const configSkeleton = utils.configSkeleton
const config = utils.fetchConfig()
Object.assign(configSkeleton, config)
fs.writeFileSync(path.join(__dirname, "../config.json"), JSON.stringify(configSkeleton, null, 4))

/* <-- Classes --> */
/**
 * The main class for the terminal client.
 */
class TerminalClient {
    constructor () {
        this.client = new Client({ checkUpdate: false })
        this.ui = new Ui(this.client)
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
        const time = utils.convertDate(Date.now())

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
            promptBox.setContent(`{bold}${utils.icon}{/bold}\n\n{bold}${message}{/bold}`)
            this.screen.append(promptBox)
            this.screen.render()
            break

        case "large_error":
            promptBox.setLabel(" Error ")
            promptBox.setContent(`${utils.colors.red}{bold}${utils.icon}{/bold}${utils.colors.reset}\n\n{bold}${message}{/bold}`)
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
        const token = config.token
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

/* <-- Exports --> */
module.exports = {
    TerminalClient
}

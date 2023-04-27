/* eslint-disable no-unused-vars */
const blessed = require("blessed")
const contrib = require("blessed-contrib")

class Ui {
    constructor (client, utils, config) {
        this.client = client
        this.utils = utils
        this.config = config

        this.screen = blessed.screen({
            smartCSR: true,
            fullUnicode: this.config.unicode === "true" || this.config.unicode === true,
            dockBorders: true,
            autoPadding: false,
            title: "Nyx"
        })

        this.screen.key(["escape", "q", "C-c"], function (ch, key) {
            return process.exit(1)
        })

        this.screen.key(["tab"], function (ch, key) {
            this.messagesBox.log("tab")
        })

        this.screen.key(["S-tab"], function (ch, key) {
            this.messagesBox.log("S-tab")
        })
    }

    configureScreen () {
        const serverList = contrib.tree({
            parent: this.screen,
            top: "top",
            left: "left",
            width: "15%",
            height: "100%",
            label: " {bold}Server List{/bold} ",
            tags: true,
            treePrefix: "",
            template: {
                lines: false,
                extend: "",
                retract: ""
            },
            border: {
                type: "line",
                fg: "white"
            },
            style: {
                bg: "black",
                fg: "white",
                focused: {
                    bg: "white",
                    fg: "black"
                }
            }
        })

        const messagesBox = blessed.log({
            parent: this.screen,
            left: "15%",
            width: "85%",
            height: "85%",
            tags: true,
            border: {
                type: "line",
                fg: "white"
            },
            style: {
                bg: "black",
                fg: "white",
                focused: {
                    bg: "white",
                    fg: "black"
                }
            }
        })

        const enterMessageBox = blessed.textarea({
            parent: this.screen,
            top: "85%",
            left: "15%",
            width: "85%",
            height: "17%",
            tags: true,
            label: " {bold}Enter Message{/bold} ",
            border: {
                type: "line",
                fg: "white"
            },
            style: {
                bg: "black",
                fg: "white",
                focused: {
                    bg: "white",
                    fg: "black"
                }
            }
        })
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
            parent: this.screen,
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
            this.screen.render()
            break

        case "large_error":
            promptBox.setLabel(" Error ")
            promptBox.setContent(`${this.utils.colors.red}{bold}${this.utils.icon}{/bold}${this.utils.colors.reset}\n\n{bold}${message}{/bold}`)
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
}

module.exports = {
    Ui
}

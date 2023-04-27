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
}

module.exports = {
    Ui
}

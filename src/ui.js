const { Utils } = require("./utils")
const blessed = require("blessed")
// eslint-disable-next-line no-unused-vars
const contrib = require("blessed-contrib")

const utils = new Utils()

class Ui {
    constructor () {
        this.config = utils.fetchConfig()

        this.screen = blessed.screen({
            smartCSR: true,
            fullUnicode: this.config.client.unicode === "true",
            dockBorders: true,
            autoPadding: false,
            title: "Nyx"
        })

        this.screen.key(["escape", "q", "C-c"], function (ch, key) {
            return process.exit(1)
        })

        this.screen.key(["tab"], function (ch, key) {
            this.screen.focusNext()
        })
    }
}

module.exports = {
    Ui
}

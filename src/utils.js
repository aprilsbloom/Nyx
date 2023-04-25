const path = require("path")
const fs = require("fs")

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

        this.configSkeleton = {
            token: "",
            prefix: "t!",
            unicode: true
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
        let config = ""

        try {
            config = JSON.parse(fs.readFileSync(configPath, "utf8"))
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log(`${this.colors.red}[!]${this.colors.reset} Config file not found. Creating one...`)
                fs.writeFileSync(configPath, JSON.stringify(this.configSkeleton, null, 4))
                console.log(`${this.colors.green}[+]${this.colors.reset} Config file created. Please fill it out and restart the client.`)
                process.exit(1)
            } else {
                console.log(`${this.colors.red}[!]${this.colors.reset} An error occurred while reading the config file: ${err}`)
                process.exit(1)
            }
        }

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

module.exports = {
    Utils
}

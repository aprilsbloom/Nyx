class TerminalClient {
    constructor() {
        console.log("terminalclient");
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
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾`
    }

    printIcon() {
        console.log(this.icon);
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
Utils = {
    zip: function (rows) {
        return rows[0].map((_, c) => rows.map((row) => row[c]));
    },

    checkIfEmpty: function (str) {
        return str.trim() === "";
    },

    date: function (unix) {
        let date = new Date(unix);
        let hour = date.getHours().toString();
        let minute = date.getMinutes().toString();
        let second = date.getSeconds().toString();

        if (hour.length == 1) {
            hour = "0" + hour;
        }
        if (minute.length == 1) {
            minute = "0" + minute;
        }
        if (second.length == 1) {
            second = "0" + second;
        }

        return `${hour}:${minute}:${second}`;
    },

    icon: `______________
|              |
|  \\           |
|   \\          |
|   /          |
|  /  _______  |
|              |
‾‾‾‾‾‾‾‾‾‾‾‾‾‾`,
},

module.exports = {
    Utils
}
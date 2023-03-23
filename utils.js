Utils = {
    zip: function (rows) {
        return rows[0].map((_, c) => rows.map((row) => row[c]));
    },

    checkIfEmpty: function (str) {
        return str.trim() === '';
    },

    date: function (unix) {
        let date = new Date(unix);
        let hour = date.getHours().toString().padStart(2, '0');
        let minute = date.getMinutes().toString().padStart(2, '0');
        let second = date.getSeconds().toString().padStart(2, '0');

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
};

module.exports = {
    Utils,
};

/* <- imports -> */
const { Ui } = require("./ui");


/* <- termclient class -> */
class TermClient {
  constructor(config) {
    this.ui = new Ui(config.client.unicode === "true");

    this.ui.on_server_select((node) => {
      let message_history = this.getMessages(node._channel_id);
    });

    this.ui.log_text("_messagesBox", "test!");
  }
}


/* <- utils -> */
Utils = {
  zip: function(rows) {
    return rows[0].map((_, c) => rows.map((row) => row[c]));
  },

  checkIsEmpty: function(str) {
    return str.trim() === '';
  },

  convertUnix: function(timestamp) {
    let date = new Date(timestamp);
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();

    hour = hour.length == 1 ? `0${hour}` : hour;
    minute = minute.length == 1 ? `0${minute}` : minute;
    second = second.length == 1 ? `0${second}` : second;

    return `${hour}:${minute}:${second}`;
  },

  writeHelp: function(fn) {
    fn("This is an indev version of the client at https://github.com/paintingofblue/discord-terminal-client. Modified by 13-05.");
  }
}


/* <- exports -> */
module.exports = { 
  TermClient,
  Utils,
};

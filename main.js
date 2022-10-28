/* <- imports -> */
const fetch = require("node-fetch");
const { TermClient, Utils } = require("./lib");
const ini = require("ini");
const fs = require("fs");


/* <- config parsing -> */
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));


/* <- configure client things -> */
let termclient = new TermClient(config);

termclient.on_ready = async function(client) {
  termclient._loginSpinner.stop();
  termclient.ui.render_tui();
  await termclient.ui.when_ready(termclient.ui);
  Utils.writeHelp(termclient.ui, "_messagesBox");
}

termclient.on_message = async function(client, message) {
  if (message.channel.id == termclient.channel_id) {
    let attachments = message.attachments.map((a) => a.url);
    let time = Utils.convertUnix(message.createdTimestamp);

    if (attachments.length != 0) {
      termclient.ui.log_text("_messagesBox", message.cleanContent.length == 0 ? `${time} ${message.author.username}#${message.author.discriminator}: ${attatchments}` : `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}\n${attatchments}`);
    }
    else {
      termclient.ui.log_text("_messagesBox", `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
    }
  }
}


/* <- start it! -> */
termclient.start();

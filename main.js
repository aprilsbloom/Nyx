/* <- imports -> */
onst { TermClient, Utils } = require("./lib");
const ini = require("ini");
const fs = require("fs");


/* <- config parsing -> */
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));


/* <- configure client things -> */
let termclient = new TermClient(config);

termclient.on_ready = async function(client) {
  termclient.ui.render_tui();
  await termclient.ui.when_ready(termclient.ui);
  Utils.writeHelp(termclient.ui, "_messagesBox");
}

termclient.on_message = async function(client, message) {
  if (message.channel.id == termclient.channel_id) {
    let time = Utils.convertUnix(message.createdTimestamp);
    if (message.author.id == termclient._discord.user.id) return;
    if (message.channel.type.includes("DM")) {
      termclient.ui.log_text("_messagesBox", `${time} ${message.author.username}#${message.author.discriminator}: ${message.cleanContent}`);
    }
    else termclient.ui.log_text("_messagesBox", `${time} ${message.member.nickname} (${message.author.username}#${message.author.discriminator}): ${message.cleanContent}`);
  }
}


/* <- start it! -> */
termclient.start();

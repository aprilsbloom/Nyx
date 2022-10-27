/* <- imports -> */
const fetch = require("node-fetch");
const { TermClient, Utils } = require("./lib");
const ini = require("ini");
const fs = require("fs");


/* <- config parsing -> */
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));


/* <- globals -> */
let termclient = new TermClient(config);

const startkey = "{black-fg}{white-bg}";
const endkey = "{/black-fg}{/white-bg}";

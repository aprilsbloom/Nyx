/* <- imports -> */
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const CLI = require("clui"), Spinner = CLI.Spinner;


/* <- ui class -> */
class Ui {
  constructor(unicode) {
    // --- putting these here so i dont forget about them ---
    const countdown = new Spinner("Logging in...", ["-", "\\", "|", "/"]);
    const startkey = "{black-fg}{white-bg}";
    const endkey = "{/black-fg}{/white-bg}";
    // --- ---
    this._screen = blessed.screen({
      smartCSR: true,
      fullUnicode: unicode,
      dockBorders: true,
      autoPadding: true,
    });

    this._serverList = contrib.tree({
	  	top: "top",
	  	left: "left",
	  	width: "15%",
	  	height: "100%",
	  	label: " {bold}Server List{/bold} ",
	  	tags: true,
	  	border: {
	  		type: "line",
		  },
		  style: {
		  	fg: "white",
		  	border: {
		  		fg: "white",
		  	},
		  	selected: {
		  		fg: "black",
		  		bg: "white",
		  	},
	  	},
	  });

    this._messagesBox = blessed.log({
	  	left: "15%",
	  	width: "85.4%",
	  	height: "86%",
	  	tags: true,
	  	border: {
	  		type: "line",
	  	},
	  	style: {
	  		fg: "white",
	  		border: {
	  			fg: "white",
	  		},
	  	},
	  });

    this._enterMessageBox = blessed.textarea({
	  	top: "86%",
	  	left: "15%",
	  	width: "85.4%",
	  	height: "15%",
	  	tags: true,
	  	border: {
	  		type: "line",
	  	},
	  	label: " {bold}Enter Message{/bold} ",
	  	style: {
	  		fg: "white",
	  		border: {
	  			fg: "white",
	  		},
  		},
	  });

    this._serverList.on("select", async (node) => {
      if (node._channel_id) {
        section_name = node.parent.name;
        this._enterMessageBox.clearValue();

        await this._serverListSelectHandler(node);
      }

      section_name = " {bold}Server List{/bold} ";
      this._screen.render();
    });

    this._screen.key(["escape", "C-c"], (_ch, _key) => process.exit(0));

    this._serverList.focus();

  	this._screen.append(this._serverList);
  	this._screen.append(this._messagesBox);
  	this._screen.append(this._enterMessageBox);

    this._screen.render();
  }

  on_server_select(fn) {
    this._serverListSelectionHandler = fn;
  }

  async _serverListSelectHandler() {
    return;
  }

  log_text(area_name, text) {
    if (this[area_name]) {
      this[area_name].log(text)
    }
    else {
      throw TypeError(`${area_name} does not exist.`);
    }
  }
}


/* <- exports -> */
module.exports = {
  Ui,
};

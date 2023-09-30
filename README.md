# Nyx

This is a terminal client for Discord, written in Node.js.

**NOTE**: I have chosen to archive this project as I have no intent in continuing development.
The libraries available for TUI's in Node are incredibly limited in regard to functionality, but I may consider rewriting this in another language soon.
Anyone is welcome to use this code/repo for whatever they may need it for, i.e making a terminal client for Discord.

## Commands

These commands can be ran using the set prefix in `config.ini`. By default, this is set to `t!`

- **exit** - exits the client.
- **help** - prints the help message.
- **clear** - clears the message box

## Config

The file `config.ini` contains some of the crucial information for this client. These are the keys and their values to the client:

- `token`: (string) your token for Discord, used to log in as you
- `unicode`: (boolean) whether or not to attempt rendering unicode symbols in the client
- `prefix`: (string) the prefix for commands

## Screenshots

![Login screen](https://github.com/paintingofblue/Nyx/assets/90877067/4ff9e4f7-a985-4c2e-8605-eb153f92ce8a)
![Home screen](https://github.com/paintingofblue/Nyx/assets/90877067/3bcfec9c-d254-47cb-865b-23ffbc4f1942)
![Example of what actual text channels are rendered like](https://github.com/paintingofblue/Nyx/assets/90877067/8abb6ada-8150-4c0f-b3b3-957ab3c016ce)

## ~~To-do~~

~~- [ ] Rewrite into classes (possibly ts as well)~~
~~- [ ] Add ability to navigate previously sent messages in the chat
~~- [ ] Add popup on messages when button is pressed (to edit, delete, pin etc, this will require a rewrite of how I log messages)~~
~~- [ ] Add user role color, unsure if that'll be able to be done well due to different terminals supporting different colors~~
~~- [ ] Add centered timestamps so that old messages aren't clumped together when a channel is inactive.~~
~~- [ ] Cache chats to a json file to allow for easy access of loading servers. This will be invalidated on each launch to prevent issues~~
    ~~- i.e whenever a server is loaded, its cached in a state object~~
    ~~- whenever there are new channels made / channels are rearranged, i can just update the state object~~
    ~~- similar concept could be applied to messages, they're queried and then its cached in a state object, then new messages are added to that~~
    ~~- means i don't have to query things multiple times, very unoptimized~~
~~- [ ] Add keybind lines to config file, which would allow for easy access to change them~~
~~- [ ] Add guild search (could be a keybind, would make a popup)~~
~~- [ ] Add reply functionality & add replies to log in the messages~~
~~- [ ] Make pins viewable~~
~~- [ ] Get notifications to work~~
~~- [ ] Log channels into categories, possibly even separate servers from channels to another box~~
~~- [ ] Add message logging (if something gets deleted or edited, change the content visually)~~
~~- [ ] Add scrollable chat~~

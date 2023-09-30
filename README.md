# Nyx

This is a terminal client for Discord, written in Node.js.

**NOTE**: I have chosen to archive this project as I have no intent in continuing development.
The libraries available for TUI's in Node are incredibly limited in regard to functionality, but I may consider rewriting this in another language soon.
Anyone is welcome to use this code/repo for whatever they may need it for, i.e making a terminal client for Discord, and I hope this license is freeing enough; if not, feel free to open an issue and I can change it.

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
~~- [ ] Add ability to navigate previously sent messages in the chat to reply, delete, edit, or add reactions (this will require a rewrite of how I log messages)~~
~~- [ ] Add user role color, unsure if that'll be able to be done well due to different terminals supporting different colors~~
~~- [ ] Add centered timestamps so that old messages aren't clumped together when a channel is inactive.~~

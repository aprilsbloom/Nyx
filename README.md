# Nyx

This is a WIP terminal client for Discord, written in nodejs.

## Commands

These commands can be ran using the set prefix in `config.ini`. By default, this is set to `t!`

- **exit** - exits the client.
- **help** - prints the help message.
- **clear** - clears the message box

## Config

The file `config.ini` contains some of the crucial information for this client. These are the keys and their values to the client:

- `token`: (string) your token for Discord, used to log in as you
- `unicode`: (boolean) whether or not to attempt rendering unicode symbols in the client
- `prefix`: (string) the prefix for commands, though in this fork commands aren't present (yet!)

## Screenshots

![image](https://user-images.githubusercontent.com/90877067/197710779-d018c892-63ed-4e02-a57a-61aaef04d1e4.png)

## To-do

- [ ] Rewrite into classes (possibly ts as well)
- [ ] Add ability to navigate previously sent messages in the chat to reply, delete, edit, or add reactions (this will require a rewrite of how I log messages)
- [ ] Add user role color, unsure if that'll be able to be done well due to different terminals supporting different colors
- [ ] Add centered timestamps so that old messages aren't clumped together when a channel is inactive.

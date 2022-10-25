# Discord Terminal Client
This is a work in progress terminal client for Discord written in JavaScript.

# Commands
These commands can be ran using the set prefix in `config.ini`. By default, this is set to `t!`
- **exit** - exits the client.
- **help** - prints the help message.
- **clear** - clears the message box

# Config
Open config.ini, place:
- **Your Discord token** - in the token area.
- **Unicode** - `true/false` value in the unicode area (tells the client to display unicode or not)
- **Prefix** - in the prefix area for the Client's commands

# Screenshots
![image](https://user-images.githubusercontent.com/90877067/197710779-d018c892-63ed-4e02-a57a-61aaef04d1e4.png)

# To-do
- [ ] Re-do login UI, looks bad since I only have a spinner
- [ ] Re-format code to use switch statements instead of massive else if blocks 
- [ ] Sort channels & DMs based off of their position in the sidebar
- [ ] Add ability to navigate previously sent messages in the chat to reply, delete or edit.
- [ ] Add user role color, unsure if that'll be able to be done but I'll try.
- [ ] Add centered timestamps so that old messages aren't clumped together when a channel is inactive.

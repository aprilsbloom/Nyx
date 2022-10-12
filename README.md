# Discord Terminal Client
This is a work in progress terminal client for Discord written in JavaScript.

# Showcase

![image](https://user-images.githubusercontent.com/90877067/194804677-bc8f38ba-a573-47a0-8f20-dc2d252bea33.png)

# Commands
- ***switchchannel <​index​>**
  - Switches the selected channel. The index argument corresponds to the channel list on the left of your screen.
- ***clear**
  - Clears the message history in the chat.
- ***menu**
  - Returns to the Menu
- ***exit**
  - Exits the client

# To-do
I have partially implemented blessed (a TUI framework) into this, but I will continue to add to it. 

I have only implemented this in the server UI.

- [x] Server list
- [x] Channel list
- [x] Message listener
- [x] Sending messages
- [x] Showing attachment URLs
- [ ] Add nested list on side of UI for servers and their channels
- [ ] Rewrite Menu UI

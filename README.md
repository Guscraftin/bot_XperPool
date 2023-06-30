# XperPool Bot

This is the discord bot of the [discord server (insert link)]().  
More information about this project is available on the [XperPool Website](https://xperpool.fr/).

## Commands
### Admin Only
- adminitems: manage the 'items' database.
- adminscore: manage the 'score' database.
- adminuser: manage the 'member' database.
- clear: clear some messages in a channel.
- commu: create or delete a commu (role and category).
- docs: send a embed message.
- embed: send a custom embed message.
- getdb: get some tables of the databases in excel file.
- message: copy a message in another channel.
- mission: create or edit a mission.
- suggest: manage a suggestion message.
### For everyone
- boutique: display and buy a item of the shop.
- info: information about the bot.
- leaderboard: get the leaderboard of all member.
- score: get the score of a member.

## User application
- Contact: display info about a member. [Admin Only]

## Features
- Add 1 point when a member send a message (cooldown 5 secondes).
- Add 5 points when a member react to a suggestion.
- Rmove 5 points when a member remove his reaction to as suggestion.
- Add 10 points when a member has a suggestion accepted.
- Delete the user of the 'score' database when he left the guild.
- Log when a user joins or leaves the server.
- Logs when a message changes or is deleted.
- Logs when a role is added or removed from a user.
- Logs when a moderation actions as they occur (mute/ban).
- Logs when a member react to a mission.
- Manage automatically the Vocal Général (unlock when at least one admin is in).
- Mission system.
- Send a welcome message to the new user.
- Send a welcome message in the general channel when a user receives the "members" role.
- Shop system.
- Suggestion system.

## Database
- Items: Items for sale in the shop.
- LogMissions: log when a member react to a mission.
- Member: score of a member for the economic system.
- Missions: all mission send in public channel.


## Bot Installation

1. Clone this repository using the command `git clone https://github.com/Guscraftin/bot_XperPool.git`.  
*You must have Git installed on your machine. If your machine doesn't recognize the **git** command, you can install it using this link: https://git-scm.com/download/. Once Git is installed, open **Git Bash** to execute Git commands.*

2. Navigate to the root directory of the downloaded repository (using the command `cd bot_XperPool`) and run the command: `npm i`.  
*You must have Node.js installed on your machine. If your machine doesn't recognize the **npm** command, you can install it using this link: https://nodejs.org/download/*.

3. Rename the `.env.example` file to `.env`.
4. Replace the `...` placeholders of the three variables in `.env` with your own values.

## Bot Launch

- Execute the command `node .` in the previously cloned folder.

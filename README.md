# XperPool Bot

This is the discord bot of the [discord server (insert link)]().  
More information about this project is available on the [XperPool Website](https://xperpool.fr/).

## Commands
### Admin Only
- **adminitems:** manage the 'items' database.
- **adminscore:** manage the 'score' database.
- **adminticket:** manage the 'ticket' database.
- **adminuser:** manage the 'member' database.
- **clear:** clear some messages in a channel.
- **commu:** create or delete a commu (role and category).
- **docs:** send an embed message.
- **embed:** send a custom embed message.
- **getdb:** get some tables of the databases in Excel file.
- **message:** copy a message in another channel.
- **mission:** create or edit a mission.
- **suggest:** manage a suggestion message.
### For everyone
- **boutique:** display and buy an item from the shop.
- **info:** information about the bot.
- **leaderboard:** get the leaderboard of all members.
- **score:** get the score of a member.

## User application
- **Profil:** display info about a member. [Admin Only]

## Features
- Send a welcome DM message when a user joins the guild.
- Send a welcome message in the general channel when the user receives the "Members" role.
- Ticket system:
  - Asks the user the reason for opening the ticket (via a select menu).
  - Create the ticket in the 'ticket' category for non-members and in the 'ticket members' category for members and update the database.
  - Confirm button to close a ticket.
  - Send transcription of the ticket in log-ticket channel and update the database. 
  - Delete the user of the 'Tickets' database and his ticket channel when he left the guild.
- Mission system:
  - Logs in the database and create a thread in details-mission when a member reacts to a mission.
  - Send log message in staff thread, update the database and disable button for the member when he accept the mission.
  - Update the description mission from the thread staff channel to all thread members.
  - Delete the user of the 'LogMissions' database and his threads channels when he left the guild.
- Point system:
  - Add 1 point when a member sends a message (cooldown 5 seconds).
  - Add 5 points when a member reacts to a suggestion.
  - Remove 5 points when a member removes his reaction to a suggestion.
  - Add 10 points when a member has a suggestion accepted.
  - Send a message in the staff channel when a user buys an item in the shop.
  - Delete the user of the 'score' database when he left the guild.
- Suggestion system:
  - Delete and send an embed with the three reactions and the delete message when a member sends a message in the suggestion channel.
- Channel logs:
  - Log when a user joins or leaves the server.
  - Logs when a message changes or is deleted.
  - Logs when a role is added or removed from a user.
  - Logs when moderation actions as they occur (mute/ban).
  - Logs when a ticket was closed.
- Manage automatically the Vocal Général (unlock when at least one admin is in).

## Databases
- **Items**: List of items available for purchase in our shop.
- **LogMissions**: Track of member reactions to missions with detailed logs.
- **Member**: Track the information and the score of each member.
- **Missions**: Stay updated on all missions shared in our public channel.
- **Tickets**: Information about past and current tickets.


## Bot Installation

1. Clone this repository using the command `git clone https://github.com/Guscraftin/bot_XperPool.git`.  
*You must have Git installed on your machine. If your machine doesn't recognize the **git** command, you can install it using this link: https://git-scm.com/download/. Once Git is installed, open **Git Bash** to execute Git commands.*

2. Navigate to the root directory of the downloaded repository (using the command `cd bot_XperPool`) and run the command: `npm i`.  
*You must have Node.js installed on your machine. If your machine doesn't recognize the **npm** command, you can install it using this link: https://nodejs.org/download/*.

3. Rename the `.env.example` file to `.env`.
4. Replace the `...` placeholders of the three variables in `.env` with your own values.

5. You can customize certain constants in `src/const.json` and `src/constDev.json` to suit your server's needs.

## Bot Launch

- Execute the command `node .` in the previously cloned folder.

# XperPool Bot

This is the discord bot of the [discord server](https://discord.gg/pnSCVTkWbU).  
More information about this project is available on the [XperPool Website](https://xperpool.fr/).

## Commands
### Admin Only
- **admincommu:** manage the 'communities' database => Use `/commu` if you want to manage the community. This command is intended only for individuals who are responsible for managing the bot.
  - **add:** add a new community in the database.
  - **list:** list all communities in the database.
  - **delete:** delete a community in the database.
- **adminitems:** manage the 'items' database.
  - **add:** add a new item in the shop.
  - **edit:** edit the name, description, or price of an item in the shop.
  - **remove:** remove one item from the shop.
  - **clear:** delete all items from the database.
- **adminscore:** manage the 'score' database.
  - **add:** add some points to a member.
  - **remove:** remove some points to a member.
  - **set:** set some points to a member.
  - **clear:** set to 0 the points of a member.
  - **clearall:** set to 0 the points of all members (with a confirmation button).
  - **deleteall:** delete all member in the database (with the member score and a confirmation button).
- **adminticket:** manage the 'ticket' database.
  - **list:** list all transcripts from the database (in accordance with the command arguments).
  - **delete:** delete one transcript ticket from the database.
  - **deleteall:** delete multiple transcript tickets from the database (in accordance with the command arguments).
- **adminuser:** manage the 'member' database.
  - **add:** add a user in the database (update the database, change nickname, add his commu roles and the member role).
  - **edit:** edit a user in the database (update the database, and his commu roles).
- **clear:** clear some messages in a channel.
- **commu:** create or delete a commu (role and category) => Sometimes the category is not in the right place, so you'll have to move it by hand to respect the alphabetical order of the communities.
  - **add:** create a new role and a new category like other commu categories. => Use it only if there is at least one community already in the database. Otherwise, manually create the role and channel for the first community, and add it using the `/admincommu` command.
  - **remove:** delete the role and the category of the commu.
- **docs:** send an predefined embed message. [Only owner bot except for 'Contacter-nous']
- **embed:** send a custom embed message.
- **getdb:** get some tables of the databases in an Excel file.
  - **items:** get the 'items' tables from the database to an Excel file.
  - **logmissions:** get the 'logmissions' tables from the database to an Excel file.
  - **members:** get the 'members' tables from the database to an Excel file.
  - **missions:** get the 'missions' tables from the database to an Excel file.
  - **tickets:** get the 'tickets' tables from the database to an Excel file.
- **message:** copy a message in another channel.
  - **copier:** copy a message content or a message embed in another channel.
- **mission:** create, edit, or delete a mission.
  - **add:** create an example of the embed mission (validate it to publish the mission in select mission channel).
  - **edit:** update an embed mission (update all embeds, update the database, send a message to all thread members and the staff thread, if the status is set to close, delete all threads channels after send them a message and wait 48 hours).
  - **delete:** delete a mission (delete all embeds and the staff thread, delete the mission in the database, all thread members after send then a message and wait 48 hours).
- **suggest:** accept or refuse a suggestion message.
  - **accepter:** valid a suggestion.
  - **refuser:** refuse a suggestion.
### For everyone
- **boutique:** display and buy an item from the shop (Send a message in staff channel when a member buy an item in the shop).
- **info:** information about the bot.
- **leaderboard:** get the leaderboard of all members.
- **score:** get the score of a member.

## User application (Right click on the member -> Applications -> ...)
- **Profil:** display info about a member. [Admin Only]

## Features
- Send a welcome DM message when a user joins the guild.
- Send a reminder DM message 12 hours after the bot is started, then every 48 hours to users in the guild who do not have the "Members" role.
- Send a welcome message in the general channel when the user receives the "Members" role.
- Ticket system:
  - Asks the user the reason for opening the ticket (via a select menu).
  - Create the ticket in the 'ticket' category for non-members and in the 'ticket members' category for members and update the database.
  - Confirm button to close a ticket.
  - Reopen button (mention the user) and delete button.
  - Send transcription of the ticket in log-ticket channel and update the database. 
  - Delete the user of the 'Tickets' database and his ticket channel when he left the guild.
- Mission system:
  - Logs in the database and create a thread in details-mission when a member reacts to a mission.
  - Send log message in staff thread, update the database and disable button for the member when he accept the mission.
  - Update the description mission from the thread staff channel to all thread members.
  - Delete the user of the 'LogMissions' database and his threads channels when he left the guild.
- Point system:
  - Add 100 points to a new member (added with the adminuser command).
  - Add 1 point when a member sends a message (cooldown 5 seconds).
  - Add 5 points when a member reacts to a suggestion.
  - Remove 5 points when a member removes his reaction to a suggestion.
  - Add 10 points when a member has a suggestion accepted.
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
- **Communities:** List of communities in the server.
- **Items**: List of items available for purchase in our shop.
- **LogMissions**: Track of member reactions to missions with detailed logs.
- **Member**: Track the information and the score of each member.
- **Missions**: Stay updated on all missions shared in our public channel.
- **Tickets**: Information about past and current tickets.


## Information about update of the server
### Something you can't change without break the bot
- The field author in suggest.js command (' - ')
- The name of the thread when a member react interested to a mission (need space between name and mission id) in mission.js command
- The channel mission in all tech category need to start by 'mission-' in mission.js command
- Format of the nickname: need a '_' between first name and surname in adminuser.js command
- Description in leaderboard ticket in ticket_previous.js/ticket_next.js button and adminticket.js command
- The footer of the shop in shop_previous.js/shop_next.js button and boutique.js command
- The footer of the shop in score_lb_previous.js/score_lb_next.js button and leaderboard.js command
- Content of the preview message to send a mission in mission_send.js button and mission.js command


### Updating the const.json File with a New ID
This step is necessary only if you delete a specific item and replace it with a new one.

#### Categories
- category_tickets_members
- category_tickets

#### Channels
- channel_general
- channel_suggestions
- channel_all_missions
- channel_detail_missions
- channel_staff_missions
- channel_staff
- channel_logs_message
- channel_logs_moderation
- channel_logs_join_leave
- channel_logs_role
- channel_logs_tickets
- vocal_general

#### Emojis
- emoji_yes
- emoji_neutral
- emoji_no

#### Roles
- role_admins
- role_members


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

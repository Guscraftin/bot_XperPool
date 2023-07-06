const { Events } = require('discord.js');
const { channel_detail_missions } = require(process.env.CONST);
const { Items, Members, Missions, LogMissions, Tickets } = require('../../dbObjects');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        let guildsCount = await client.guilds.fetch();
        let usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

        // Set the bot's activity
        client.user.setPresence({ status: 'online' });

        // Sync db models with db
        try {
            await Items.sync({ alter: true });
            await Members.sync({ alter: true });
            await Missions.sync({ alter: true });
            await LogMissions.sync({ alter: true });
            await Tickets.sync({ alter: true });
        } catch (error) {
            console.error("ready.js - " + error);
        }

        // Reinitialize is_messaging to false for all members
        await Members.update({ is_messaging: false }, { where: { is_messaging: true } });

        // Delete all threads for a deleted mission
        const threads = await client.channels.fetch(channel_detail_missions).then(channel => {return channel.threads.fetch()});
        await threads.threads.filter(thread => thread.parentId === channel_detail_missions).forEach(async thread => {
            const message = await thread.messages.fetch().then(messages => {return messages.first()});
            if (message.content.includes("mission a été supprimé")) {
                await thread.delete();
            }
        });

        // Send a message when the bot is ready
        console.log(`${client.user.username} est prêt à être utilisé par ${usersCount} utilisateurs sur ${guildsCount.size} serveurs !`);
    },
};

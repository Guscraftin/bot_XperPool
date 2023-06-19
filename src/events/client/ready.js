const { Events } = require('discord.js');
const { Member, Mission } = require('../../dbObjects');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        let guildsCount = await client.guilds.fetch();
        let usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

        client.user.setPresence({ status: 'online' });

        // Sync db models with db
        await Member.sync({ alter: true });
        await Mission.sync({ alter: true });

        console.log(`${client.user.username} est prêt à être utilisé par ${usersCount} utilisateurs sur ${guildsCount.size} serveurs !`);
    },
};
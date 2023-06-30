const { Events } = require('discord.js');
const { channel_detail_missions } = require(process.env.CONST);
const { Items, Members, Missions, LogMissions } = require('../../dbObjects');

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
        } catch (error) {
            console.error("ready.js - " + error);
        }

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


//////////////////////////////////////////////////////////////////////////////////////////
// NOT USED
// Fetch RSS feed
// With a lib like rss-parser for parsing the feed
async function fetchLatestArticles(client, rssUrl, channelId) {
    try {
        const feed = await parser.parseURL(rssUrl);
        const latestArticles = feed.items[0];

        if (latestArticles) {
            // console.log(latestArticles);
            const channel = await client.channels.fetch(channelId);

            const existingArticles = await Articles.findOne({ where: { link: latestArticles.link } });
            if (!existingArticles) {
                const embed = new EmbedBuilder()
                    .setTitle(latestArticles.title)
                    .setURL(latestArticles.link)
                    .setAuthor({ name: latestArticles.author })
                    .setTimestamp(new Date(latestArticles.isoDate));

                channel.send({ embeds: [embed] });

                // Register the last Articles in the database
                await Articles.create({ title: latestArticles.title, link: latestArticles.link });
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'extraction du flux RSS :', error);
    }

    setTimeout(fetchLatestArticles, 60000, client, rssUrl, channelId);
}

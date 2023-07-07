const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');
const { channel_detail_missions, color_basic } = require(process.env.CONST);
const { Communities, Items, Members, Missions, LogMissions, Tickets } = require('../../dbObjects');

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
            await Communities.sync({ alter: true });
            await Items.sync({ alter: true });
            await Members.sync({ alter: true });
            await Missions.sync({ alter: true });
            await LogMissions.sync({ alter: true });
            await Tickets.sync({ alter: true });
        } catch (error) {
            console.error("ready.js syncDB - " + error);
        }

        // Reinitialize is_messaging to false for all members
        await Members.update({ is_messaging: false }, { where: { is_messaging: true } });

        // Delete all threads for a deleted mission
        const threads = await client.channels.fetch(channel_detail_missions).then(channel => { return channel.threads.fetch() });
        await threads.threads.filter(thread => thread.parentId === channel_detail_missions).forEach(async thread => {
            const message = await thread.messages.fetch().then(messages => { return messages.first() });
            if (message.content.includes("mission a été supprimé")) {
                await thread.delete();
            }
        });

        // Start the function calledEvery48h for sending DM to members not in the database
        await calledEvery48h(sendDM, client);

        // Send a message when the bot is ready
        console.log(`${client.user.username} est prêt à être utilisé par ${usersCount} utilisateurs sur ${guildsCount.size} serveurs !`);
    },
};


/**
 * Call a function every 48 hours
 */
async function calledEvery48h(callback, client) {
    // Duration in milliseconds (48 hours)
    const duration = 48 * 60 * 60 * 1000;

    // Call the first time the callback function
    await callback(client);

    // Call the callback function every 48 hours
    setInterval(callback, duration, client);
}

/**
 * Send a DM message to all members who are not in the database
 */
async function sendDM(client) {
    // Get all members of the server
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const members = await guild.members.fetch();

    // Get all members in the database
    const membersInDB = await Members.findAll();

    // Get all members who are not in the database
    const membersNotInDB = members.filter(
        (member) => !membersInDB.some((m) => m.member_id === member.id)
    );

    // Send a DM message to all members who are not in the database
    membersNotInDB.forEach(async (member) => {
        if (member.user.bot) return;

        const embed = new EmbedBuilder()
            .setDescription(`## Bonjour ${member} !\nJ'ai remarqué que vous n'avez pas encore remplit le formulaire d'accès qui vous permettra de profiter de toutes les fonctionnalités du serveur ${guild.name}.\n\nL'équipe administrative du projet est impatiente de recevoir votre réponse au formulaire suivant : **https://tally.so/r/3EKPvN**.`)
            .setColor(color_basic)
            .setThumbnail('https://media.discordapp.net/attachments/1117544311848976505/1117544390534119554/Xperpool_logo_2.jpeg?width=225&height=225')
            .setFooter({ text: "A tout de suite dans le formulaire !" })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Lien vers le formulaire')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://tally.so/r/3EKPvN')
            );

        await member.send({ embeds: [embed], components: [row] }).catch(() => {});
    });
}






//////////////////////////////////////////////////////////////////////////////////////////
// NOT USED
// Fetch RSS feed
// With a lib like rss-parser for parsing the feed
async function fetchLatestArticles(client, rssUrl, channelId) {
    try {
        const feed = await parser.parseURL(rssUrl);
        const latestArticles = feed.items[0];

        if (latestArticles) {
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

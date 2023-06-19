const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_moderation } = require('../../const.json');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban){

        /*
         * Log
         */
        try {
            await ban.fetch();

            const embed = new EmbedBuilder()
                .setTitle(`Banissement`)
                .setColor('#009ECA')
                .setDescription(`**\`${ban.user.username}\` a été banni.**
                > **Id :** \`${ban.user.id}\`
                > **Raison :** \`${ban.reason === null ? `Aucune raison fourni` : `${ban.reason}`}\`
                `)
                .setThumbnail(ban.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL() })

            ban.guild.channels.fetch(channel_logs_moderation).then(channel =>
                channel.send({ embeds: [embed] })
            );
        } catch (error) {
            console.error("guildBanAdd.js Logs - " + error);
        }
    }
};
const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_moderation } = require('../../const.json');

module.exports = {
    name: Events.GuildBanRemove,
    async execute(ban){

        /*
         * Log
         */
        try {
            const embed = new EmbedBuilder()
                .setTitle(`Débanissement`)
                .setColor('#009ECA')
                .setDescription(`**\`${ban.user.username}\` a été débanni.**
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
            console.error("guildBanRemove.js Logs - " + error);
        }
    }
};
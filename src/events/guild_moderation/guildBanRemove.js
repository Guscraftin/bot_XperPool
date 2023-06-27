const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_moderation } = require(process.env.CONST);

module.exports = {
    name: Events.GuildBanRemove,
    async execute(ban){

        /*
         * Log
         */
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
    }
};
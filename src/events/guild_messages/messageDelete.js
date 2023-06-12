const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_message } = require('../../const.json');

module.exports = {
    name: Events.MessageDelete,
    async execute(message){
        
        // Send the log message to the log channel
        try {
            let embed;
            if (message.author === null) {
                embed = new EmbedBuilder()
                    .setTitle(`Suppression d'un message`)
                    .setColor('#009ECA')
                    .setDescription(`**Message envoyé par \`un membre\` supprimé dans ${message.channel}.**`)
                    .setTimestamp()
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })

            } else {
                embed = new EmbedBuilder()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .setColor('#009ECA')
                    .setDescription(`**Message envoyé par ${message.author} supprimé dans ${message.channel}.**\n` +
                    `${message.content}`)
                    .setTimestamp()
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            }
            
            message.guild.channels.fetch(channel_logs_message).then(channel =>
                channel.send({ embeds: [embed] })
            );
        } catch (error) {
            console.error(error);
        }
    }
};
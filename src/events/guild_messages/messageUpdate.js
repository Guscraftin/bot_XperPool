const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_message } = require('../../const.json');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage){

        /*
         * Log
         */
        if (newMessage.author.bot) return;

        const oldContentMessage = oldMessage.content;
        const newContentMessage = newMessage.content;

        let embed = new EmbedBuilder()
            .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
            .setColor('#009ECA')
            .setTimestamp()
            .setFooter({ text: newMessage.guild.name, iconURL: newMessage.guild.iconURL() })

        // Logs for edited messages
        if ((oldContentMessage === null || oldContentMessage.length <= 1024) && newContentMessage.length <= 1024) {
            embed
                .setDescription(`**Message envoyé par <@${newMessage.author.id}> modifié dans ${newMessage.channel}.** [Aller au message.](${newMessage.url})`)
                .addFields([
                    {name: `\`🔅\` - Ancien - \`🔅\``, value: `\`\`\`${oldContentMessage}\`\`\``},
                    {name: `\`🔅\` - Nouveau - \`🔅\``, value: `\`\`\`${newContentMessage}\`\`\``}
                ])

        } else return;

        newMessage.guild.channels.fetch(channel_logs_message).then(channel => 
            channel.send({ embeds: [embed] })
        );
    }
};
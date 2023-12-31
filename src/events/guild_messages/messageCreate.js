const { Events, EmbedBuilder } = require('discord.js');
const { Members, sequelize } = require('../../dbObjects');
const { channel_suggestions, emoji_yes, emoji_neutral, emoji_no } = require(process.env.CONST);

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        /*
         * Suggestions system
         */
        if (message.channel.id === channel_suggestions && !message.author.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${message.member.displayName} (${message.author.id})`, iconURL: message.author.displayAvatarURL() })
                .setColor('#009ECA')
                .setDescription(`${message.content}`)
                .setTimestamp()
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })

            message.delete();

            const msg = await message.guild.channels.fetch(channel_suggestions).then(channel =>   
                channel.send({ embeds: [embed] })
            );
            await msg.react(emoji_yes);
            await msg.react(emoji_neutral);
            await msg.react(emoji_no);
        }


        /*
         * Add score to member
         */
        try {
            if (message.author.bot) return;
            if (message.channel.type === 'DM') return;

            const member = await Members.findOne({ where: { member_id: message.author.id } });
            // Only if the member exist in the database (he passed the verification)
            if (member) {
                // Check if member has send a message in the last 5 seconds
                if (!member.is_messaging) {
                    // Update member score
                    await member.update({ score: member.score + 1, is_messaging: true });
                    setTimeout(async () => {
                        await member.update({ is_messaging: false });
                    }, 5000);
                }
            }
        } catch (error) {
            console.error("messageCreate.js AddScore - " + error);
        }
    }
};
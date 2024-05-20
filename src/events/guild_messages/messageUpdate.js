const { ChannelType, Events, EmbedBuilder } = require('discord.js');
const { channel_logs_message, channel_staff_missions } = require(process.env.CONST);
const { LogMissions, Missions } = require("../../dbObjects");

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage){

        /**
         * Edit description of a mission
         */
        if (newMessage && newMessage.channel.type === ChannelType.PublicThread && newMessage.channel.parentId === channel_staff_missions) {
            const mission = await Missions.findOne({ where: { channel_staff_id: newMessage.channelId } });
            if (mission) {
                const msg = await newMessage.channel.messages.fetch().then(messages => {return messages.at(-1)});
                const logs = await LogMissions.findAll({ where: { mission_id: mission.id } });
                if (msg.id === newMessage.id) {
                    if (logs) {
                    for (const log of logs) {
                        const channelDetails = await newMessage.guild.channels.fetch(log.channel_details);
                        if (channelDetails) {
                            await channelDetails.messages.fetch().then(async messages => {
                                await messages.at(-2).edit({ content: newMessage.content });
                            });

                            const isButtEnabled = await channelDetails.messages.fetch().then(messages => {
                                return !messages.at(-3).components[0].components[0].disabled;
                            });
                            if (isButtEnabled) {
                                const member = await channelDetails.members.fetch().then(members => {
                                    return members.filter(member => !member.bot).first();
                                });
                                if (member) await channelDetails.send({ content: `<@${member.id}>, cette mission a été modifié.` });
                                else await channelDetails.send({ content: `Cette mission a été modifié.` });
                            }
                        }
                    }}
                    const staffChannel = await newMessage.guild.channels.fetch(mission.channel_staff_id);
                    if (staffChannel) {
                        await staffChannel.send({ content: `La description de cette mission a été modifié.` });
                    }
                }
            }
        }


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
        const sizeValueInField = 1024;
        const sizeDefaultDesign = 6;
        if ((oldContentMessage === null || oldContentMessage.length <= sizeValueInField - sizeDefaultDesign) && newContentMessage.length <= sizeValueInField - sizeDefaultDesign) {
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
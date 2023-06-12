const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_join_leave } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member){

        /*
         * Log
         */
        try {
            // Check if the member has been kicked
            const fetchKickLog = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 20
            });

            const kickLog = fetchKickLog.entries.first();
            const { target, reason } = kickLog;
            let isMemberKick = false;

            if (target.id === member.id) isMemberKick = true;

            // Send the log message
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.user.tag} (${member.id})`, iconURL: member.user.displayAvatarURL() })
                .setColor('#dc143c')
                .setDescription(`
• Nom d'utilisateur : ${member.displayName} - \`${member.user.tag}\` (${member.id})
• Créé le : <t:${parseInt(member.user.createdTimestamp / 1000)}:f> (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)
• Rejoint le : <t:${parseInt(member.joinedTimestamp / 1000)}:f> (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)
• Quitté le : <t:${parseInt(Date.now() / 1000)}:f> (<t:${parseInt(Date.now() / 1000)}:R>)
• Kick ? : ${isMemberKick ? `🟢 (raison : ${reason !== null ? reason : `\`Non fourni\``})` : `🔴`}
                `)
                .setTimestamp()
                .setFooter({ text: `L'utilisateur a quitté !` })

            member.guild.channels.fetch(channel_logs_join_leave).then(channel => 
                channel.send({ embeds: [embed] })
            );
        } catch (error) {
            console.error(error);
        }
    }
};
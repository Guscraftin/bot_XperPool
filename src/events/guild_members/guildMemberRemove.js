const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_join_leave } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member){

        /*
         * Log
         */
        // Check if the member has been kicked
        const fetchKickLog = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 20
        });

        const kickLog = fetchKickLog.entries.first();
        const { target: targetKick, reason: reasonKick, createdAt } = kickLog;
        let isMemberKick = false;

        if (targetKick.id === member.id && Date.now() - createdAt.getTime() < 0) isMemberKick = true;
        else {
            // Check if the member has been banned
            const fetchBanLog = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 22
            });

            const banLog = fetchBanLog.entries.first();
            const { target: targetBan, reason: reasonBan } = banLog;
            let isMemberBan = false;

            if (targetBan.id === member.id && Date.now() - banLog.createdTimestamp < 0) isMemberBan = true;
        }

        // Send the log message
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${member.user.username} (${member.id})`, iconURL: member.user.displayAvatarURL() })
            .setColor('#dc143c')
            .setDescription(
`• Nom d'utilisateur : ${member.displayName} - \`${member.user.username}\` (${member.id})
• Créé le : <t:${parseInt(member.user.createdTimestamp / 1000)}:f> (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)
• Rejoint le : <t:${parseInt(member.joinedTimestamp / 1000)}:f> (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)
• Quitté le : <t:${parseInt(Date.now() / 1000)}:f> (<t:${parseInt(Date.now() / 1000)}:R>)` +
`${isMemberKick ? `\n• Expulsé : 🟢 (raison : ${reasonKick !== null ? reasonKick : `\`Non fournie\``})` : ``}` +
`${isMemberBan ? `\n• Banni : 🟢 (raison : ${reasonBan !== null ? reasonBan : `\`Non fournie\``})` : ``}`)
            .setTimestamp()
            .setFooter({ text: `L'utilisateur a quitté !` })

        member.guild.channels.fetch(channel_logs_join_leave).then(channel => 
            channel.send({ embeds: [embed] })
        );
        

        /*
         * Delete the member from the database
         */
        try {
            const { Members } = require('../../dbObjects');
            await Members.destroy({ where: { member_id: member.id } });
        }
        catch (error) {
            console.error("guildMemberRemove.js MemberDB - " + error);
        }
    }
};
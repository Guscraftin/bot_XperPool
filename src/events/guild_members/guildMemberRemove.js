const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_join_leave } = require(process.env.CONST);

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member){

        /*
         * Log
         */
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${member.user.username} (${member.id})`, iconURL: member.user.displayAvatarURL() })
            .setColor('#dc143c')
            .setDescription(
`• Nom d'utilisateur : ${member.displayName} - \`${member.user.username}\` (${member.id})
• Créé le : <t:${parseInt(member.user.createdTimestamp / 1000)}:f> (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)
• Rejoint le : <t:${parseInt(member.joinedTimestamp / 1000)}:f> (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)
• Quitté le : <t:${parseInt(Date.now() / 1000)}:f> (<t:${parseInt(Date.now() / 1000)}:R>)`)
            .setTimestamp()
            .setFooter({ text: `L'utilisateur a quitté !` })

        member.guild.channels.fetch(channel_logs_join_leave).then(channel => 
            channel.send({ embeds: [embed] })
        );


        /**
         * Delete the tickets of the member from the database and channels
         */
        let ticketsMember;
        try {
            const { Tickets } = require('../../dbObjects');
            ticketsMember = await Tickets.findAll({ where: { user_id: member.id } });
        }
        catch (error) {
            console.error("guildMemberRemove.js AllTicketsDB - " + error);
        }

        if (ticketsMember) {
            for (const ticket of ticketsMember) {
                try {
                    if (ticket.channel_id) {
                        const channel = await member.guild.channels.fetch(ticket.channel_id).catch(() => {});
                        if (channel) await channel.delete();
                    }
                    await ticket.destroy();
                } catch (error) {
                    console.error("guildMemberRemove.js TicketsDB - " + error);
                }
            }
        }


        /**
         * Delete the missions of the member from the database and threads
         */
        let logMissionMember;
        try {
            const { LogMissions } = require('../../dbObjects');
            logMissionMember = await LogMissions.findAll({ where: { user_id: member.id } });
        }
        catch (error) {
            console.error("guildMemberRemove.js AllLogMissionsDB - " + error);
        }

        if (logMissionMember) {
            for (const logMission of logMissionMember) {
                const thread = await member.guild.channels.fetch(logMission.channel_details).catch(() => {});
                if (thread) await thread.delete();

                try {
                    await logMission.destroy();
                } catch (error) {
                    console.error("guildMemberRemove.js LogMissionsDB - " + error);
                }
            }
        }

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
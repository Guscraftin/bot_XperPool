const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_moderation, channel_logs_role, channel_general, role_members } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember){

        /*
         * Log
         */
        // Logs when a member get or remove a role
        const addRoles = listAddRole(oldMember, newMember);
        const removeRoles = listRemoveRole(oldMember, newMember);

        if (addRoles.length !== 0 || removeRoles.length !== 0) {
            // Send the log message
            const embed = new EmbedBuilder()
                .setAuthor({ name: oldMember.user.tag, iconURL: oldMember.user.displayAvatarURL() })
                .setColor('#009ECA')
                .setThumbnail(newMember.user.displayAvatarURL())
                .setDescription(`**${newMember.user} a été mis à jour.**\n` +
                `${addRoles.length !== 0 ? `> **Rôle ajouté :** ${addRoles}\n` : ``}` +
                `${removeRoles.length !== 0 ? `> **Rôle supprimé :** ${removeRoles}\n` : ``}`)
                .setTimestamp()
                .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })

            newMember.guild.channels.fetch(channel_logs_role).then(channel =>
                channel.send({ embeds: [embed] })
            );
        }
        // Logs when a member has timed out or has been un-timed out
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            // Logs when a member has timed out
            if (oldMember.communicationDisabledUntilTimestamp === null) {

                const fetchMuteLog = await newMember.guild.fetchAuditLogs({ 
                    limit: 1,
                    type: 24
                });
                
                const MuteLog = await fetchMuteLog.entries.first();
                const { executor, target, reason } = MuteLog;
                if (target.id === newMember.id && Date.now() - MuteLog.createdTimestamp < 0) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Exclusion temporaire`)
                        .setDescription(`**${newMember.user} a été exclu par ${executor}.**\n` +
                        `> **Jusque :** <t:${parseInt(newMember.communicationDisabledUntilTimestamp / 1000)}:f> (<t:${parseInt(newMember.communicationDisabledUntilTimestamp / 1000)}:R>)\n` +
                        `> **Raison :** ${reason !== null ? `${reason}` : `\`Non fournie\``}\n`)
                        .setColor('#009ECA')
                        .setThumbnail(newMember.user.displayAvatarURL())
                        .setTimestamp()
                        .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })

                    newMember.guild.channels.fetch(channel_logs_moderation).then(channel =>
                        channel.send({ embeds: [embed] })
                    );
                }
            } 
            // Logs when a member has been un-timed out
            else if (newMember.communicationDisabledUntilTimestamp === null) {
                const fetchMuteLog = await newMember.guild.fetchAuditLogs({ 
                    limit: 1,
                    type: 24
                });
                
                const MuteLog = await fetchMuteLog.entries.first();
                const { executor, target, reason } = MuteLog;
                if (target.id === newMember.id && Date.now() - MuteLog.createdTimestamp < 0) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Fin à l'exclusion temporaire`)
                        .setDescription(`**${newMember.user} arrêté d'être exclu par ${executor}.**\n` +
                        `> **Sa sanction se serait terminé dans :** <t:${parseInt(oldMember.communicationDisabledUntilTimestamp / 1000)}:f> (<t:${parseInt(oldMember.communicationDisabledUntilTimestamp / 1000)}:R>)\n`)
                        .setColor('#009ECA')
                        .setThumbnail(newMember.user.displayAvatarURL())
                        .setTimestamp()
                        .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })

                    newMember.guild.channels.fetch(channel_logs_moderation).then(channel =>
                        channel.send({ embeds: [embed] })
                    );
                }
            }
        }


        /*
         * Send a welcome message when a member get the role "Membres"
         */
        if (!oldMember.roles.cache.has(role_members) && newMember.roles.cache.has(role_members)) {
            newMember.guild.channels.fetch(channel_general).then(channel =>
                channel.send(`Bienvenue à ${newMember.user} qui vient de rejoindre notre communauté !\n` +
                `Souhaitez lui la bienvenue !`)
            );
        }
    }
};

/*
 * List of roles added
 */
function listAddRole(oldMember, newMember) {
    let listNewRole = [];
    newMember.roles.cache.forEach(element => {
        listNewRole.push(element);
    });
    oldMember.roles.cache.forEach(element => {
        let indexElement = listNewRole.indexOf(element);
        if (indexElement !== -1) {
            listNewRole.splice(indexElement, 1);
        }
    });
    return listNewRole;
}

/*
 * List of roles removed
 */
function listRemoveRole(oldMember, newMember) {
    let listOldRole = [];
    oldMember.roles.cache.forEach(element => {
        listOldRole.push(element);
    });
    newMember.roles.cache.forEach(element => {
        let indexElement = listOldRole.indexOf(element);
        if (indexElement !== -1) {
            listOldRole.splice(indexElement, 1);
        }
    });
    return listOldRole;
}
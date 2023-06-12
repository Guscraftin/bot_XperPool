const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_role, channel_general, role_members } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember){

        /*
         * Log
         */
        try {
            const addRoles = listAddRole(oldMember, newMember);
            const removeRoles = listRemoveRole(oldMember, newMember);

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
        } catch (error) {
            console.error(error);
        }


        /*
         * Send a welcome message when a member get the role "Membres"
         */
        try {
            if (!oldMember.roles.cache.has(role_members) && newMember.roles.cache.has(role_members)) {
                newMember.guild.channels.fetch(channel_general).then(channel =>
                    channel.send(`Bienvenue à ${newMember.user} qui vient de rejoindre notre communauté !\n` +
                    `Souhaitez lui la bienvenue !`)
                );
            }
        } catch (error) {
            console.error(error);
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
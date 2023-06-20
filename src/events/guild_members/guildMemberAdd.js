const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_join_leave } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member){

        /*
         * Log
         */
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${member.user.username} (${member.id})`, iconURL: member.user.displayAvatarURL() })
            .setColor('#21ff81')
            .setDescription(
`• Nom d'utilisateur : ${member} - \`${member.user.username}\` (${member.id})
• Créé le : <t:${parseInt(member.user.createdTimestamp / 1000)}:f> (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)
• Rejoint le : <t:${parseInt(member.joinedTimestamp / 1000)}:f> (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)`)
            .setTimestamp()
            .setFooter({ text: "L'utilisateur a rejoint !" })

        member.guild.channels.fetch(channel_logs_join_leave).then(channel => 
            channel.send({ embeds: [embed] })
        );  
        
        /*
         * Send a welcome DM to the new member
         */
        if (member.user.bot) return;

        const embed2 = new EmbedBuilder()
            .setColor('#0A038C')
            .setDescription(`
## Bienvenue ${member} !

Je suis le robot de la communauté XperPool !
J'ai été créer dans le but de t'aider à proposer ou trouver des missions en portage salarial dans le domaine de l'IT.

La première étape afin d'accéder à toutes mes fonctionnalités et de **remplir ce formulaire : https://tally.so/r/3EKPvN**.
Grâce à celui-ci, tu pourras accéder à l'ensemble des canaux de discussion et de recherche de missions.
`)
            .setThumbnail('https://media.discordapp.net/attachments/1117544311848976505/1117544390534119554/Xperpool_logo_2.jpeg?width=225&height=225')
            .setFooter({ text: "A tout de suite sur le serveur !" })

        member.send({ embeds: [embed2] }).catch(error => {
            if (error.message !== "Cannot send messages to this user") console.error(error);
        });
    }
};
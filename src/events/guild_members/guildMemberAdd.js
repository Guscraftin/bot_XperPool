const { Events, EmbedBuilder } = require('discord.js');
const { channel_logs_join_leave } = require('../../const.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member){

        /*
         * Log
         */
        try {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.user.tag} (${member.id})`, iconURL: member.user.displayAvatarURL() })
                .setColor('#21ff81')
                .setDescription(`
• Nom d'utilisateur : ${member} - \`${member.user.tag}\` (${member.id})
• Créé le : <t:${parseInt(member.user.createdTimestamp / 1000)}:f> (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)
• Rejoint le : <t:${parseInt(member.joinedTimestamp / 1000)}:f> (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)
                `)
                .setTimestamp()
                .setFooter({ text: "L'utilisateur a rejoint !" })

            member.guild.channels.fetch(channel_logs_join_leave).then(channel => 
                channel.send({ embeds: [embed] })
            );
        } catch (error) {
            console.error(error);
        }     
        
        /*
         * Send a welcome DM to the new member
         */
        try {
            if (member.user.bot) return;
            const guildOwnerId = await member.guild.ownerId;
            const guildOwner = await member.guild.members.fetch(guildOwnerId);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${guildOwner.user.username}`, iconURL: guildOwner.displayAvatarURL() })
                .setColor('#0A038C')
                .setDescription(`
Welcome ${member} !🎉

Nous sommes heureux de t'accueillir sur le serveur Discord de la Communauté XperPool dédiée au portage salarial IT !

Afin de pouvoir rejoindre officiellement la communauté et accéder aux différents salons, va vite remplir notre petit questionnaire pour récupérer ton accès 😉

https://tally.so/r/3EKPvN

Ici, tu pourras discuter avec d'autres professionnels de diverses secteurs, partager tes expériences et poser des questions précises sur n'importe quel domaine.

Nous proposons également des missions adaptées à ton profil pour t'aider à développer ta carrière et ta montée en compétences !

N'hésite pas à consulter les différentes sections du serveur et à participer aux discussions. Si tu as des questions ou des suggestions, tu as la possibilité de contacter notre équipe d'administration à l'aide des tickets dans le salon "Help".

Nous te souhaitons à nouveau la bienvenue sur XperPool !`)
                .addFields({ name: "NB : Tu peux aussi aller jeter un coup d'œil à notre site web !😁", value: 'Xperpool.fr' })
                .setImage('https://media.discordapp.net/attachments/1117544311848976505/1117544390534119554/Xperpool_logo_2.jpeg?width=225&height=225')

            member.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    }
};
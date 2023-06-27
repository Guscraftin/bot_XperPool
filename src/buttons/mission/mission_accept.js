const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { Members, LogMissions, Missions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_accept",
    },
    async execute(interaction) {
        
        // Update the database
        const logMission = await LogMissions.findOne({ where: { channel_details: interaction.channelId } });
        if (!logMission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la logmission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });

        try {
            await logMission.update({ is_accepted: true });
        } catch (error) {
            console.error("mission_accept.js db - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la mise à jour de la logmission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        }


        // Sends logs to staff channel of the mission
        const mission = await Missions.findOne({ where: { id: logMission.mission_id } });
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        
        const channel_staff = await interaction.guild.channels.fetch(mission.channel_staff_id);
        if (!channel_staff) return interaction.reply({ content: "Une erreur est survenue lors de la recherche du channel staff de la mission.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        
        const member = await Members.findOne({ where: { member_id: interaction.user.id } });
        if (!member) return interaction.reply({ content: "Une erreur est survenue lors de la recherche du membre dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.member.displayName} (${interaction.member.id})`, iconURL: interaction.user.displayAvatarURL() })
            .setColor('#009ECA')
            .setDescription(`Voici les informations de ce membre :`)
            .setFields([
                { name: 'Prénom', value: member.first_name, inline: true },
                { name: 'Nom', value: member.last_name, inline: true },
                { name: 'Email', value: member.email, inline: true },
                { name: 'Téléphone', value: member.tel, inline: true },
                { name: 'Technologies', value: member.technologies, inline: true },
            ])
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

        await channel_staff.send({ content: `${interaction.member} a accepté la mission !`, embeds: [embed] });
        

        // Disable button
        const row_detail = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Accepter la mission")
                .setCustomId(`mission_accept`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
        );
        interaction.message.edit({ components: [row_detail] });

        return interaction.reply({ content: "Tu as bien validé ton intérêt pour réaliser la mission !" });
    }
};
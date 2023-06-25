const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LogMissions, Missions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_accept",
    },
    async execute(interaction) {
        
        // Sends logs to staff channel of the mission
        const logMission = await LogMissions.findOne({ where: { channel_details: interaction.channelId } });
        if (!logMission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la logmission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        
        const mission = await Missions.findOne({ where: { id: logMission.mission_id } });
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        
        const channel_staff = await interaction.guild.channels.fetch(mission.channel_staff_id);
        if (!channel_staff) return interaction.reply({ content: "Une erreur est survenue lors de la recherche du channel staff de la mission.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        
        await channel_staff.send({ content: `${interaction.member} a accepté la mission !` }); // Ces détails (tel, mail, etc)
        

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
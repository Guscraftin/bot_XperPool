const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { channel_all_missions } = require("../../const.json");
const { Missions, LogMissions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_to_interested",
    },
    async execute(interaction) {
        // Get the main channel where the mission was sent
        let mission;
        if (interaction.channel.id === channel_all_missions) {
            try {
                mission = await Missions.findOne({ where: { main_msg_id: interaction.message.reference.messageId } });            
            } catch (error) {
                console.error("mission_to_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        } else {
            try {
                mission = await Missions.findOne({ where: { particular_msg_id: interaction.message.reference.messageId } });            
            } catch (error) {
                console.error("mission_to_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        }
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });


        const is_react_mission = await LogMissions.findOne({ where: { main_msg_id: mission.main_msg_id, user_id: interaction.user.id } });

        // Create the button with the link
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Mission complète")
                .setURL(mission.url)
                .setStyle(ButtonStyle.Link)
        );

        // Check if the user has already reacted to the message
        if (is_react_mission.is_interested) return interaction.reply({ content: `Revoici le bouton pour accéder à l'entièreté de la mission.`, components: [row], ephemeral: true });

        // Modify the user to the database
        try {
            LogMissions.update({ is_interested: true }, { where: { main_msg_id: mission.main_msg_id, user_id: interaction.user.id }});
        } catch (error) {
            console.error("mission_interested.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la modification de votre réponse dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        }

        return interaction.reply({
            content: "Le fait que vous êtes maintenant intéressé par cette mission a bien été pris en compte.\n" +
            `Vous trouverez ci dessous le bouton vous permettant d'accéder à l'entièreté de la mission où vous pourrez y déposer votre candidature.`,
            components: [row],
            ephemeral: true });
    },
};

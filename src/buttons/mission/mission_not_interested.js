const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { channel_all_missions } = require("../../const.json");
const { Missions, LogMissions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_not_interested",
    },
    async execute(interaction) {
        // Get the main channel where the mission was sent
        let mission;
        let is_react_main_msg = false;
        if (interaction.channel.id === channel_all_missions) {
            is_react_main_msg = true;
            try {
                mission = await Missions.findOne({ where: { main_msg_id: interaction.message.id } });            
            } catch (error) {
                console.error("mission_not_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        } else {
            try {
                mission = await Missions.findOne({ where: { particular_msg_id: interaction.message.id } });            
            } catch (error) {
                console.error("mission_not_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        }
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });


        const is_react_mission = await LogMissions.findOne({ where: { main_msg_id: mission.main_msg_id, user_id: interaction.user.id } });

        // Check if the user has already reacted to the message
        if (is_react_mission) {
            // Create the button with the link
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Mission complète")
                    .setURL(mission.url)
                    .setStyle(ButtonStyle.Link)
            );
            if (is_react_mission.is_interested) return interaction.reply({ content: `Revoici le bouton pour accéder à l'entièreté de la mission.`, components: [row], ephemeral: true });
            else return interaction.reply({ content: "Vous avez déjà répondu ne pas être intéressé par cette mission.", ephemeral: true });
        }

        // Add the user to the database
        const user_name = interaction.member.displayName.split("_");
        try {
            LogMissions.upsert({
                main_msg_id: mission.main_msg_id,
                user_id: interaction.user.id,
                first_name: user_name[0],
                last_name: user_name[1],
                is_interested: false,
                is_react_main_msg: is_react_main_msg,
            });
        } catch (error) {
            console.error("mission_not_interested.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'ajout de votre réponse dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        }

        return interaction.reply({ content: "Le fait que vous n'êtes pas intéressé par cette mission a bien été pris en compte. Merci de votre activité.", ephemeral: true });
    }
};
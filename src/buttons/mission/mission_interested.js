const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { channel_all_missions, channel_detail_missions } = require("../../const.json");
const { Missions, LogMissions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_interested",
    },
    async execute(interaction) {
        // Get the mission from the database
        let mission;
        let is_react_main_msg = false;
        if (interaction.channel.id === channel_all_missions) {
            is_react_main_msg = true;
            try {
                mission = await Missions.findOne({ where: { main_msg_id: interaction.message.id } });            
            } catch (error) {
                console.error("mission_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        } else {
            try {
                mission = await Missions.findOne({ where: { particular_msg_id: interaction.message.id } });            
            } catch (error) {
                console.error("mission_interested.js - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
            }
        }
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        if (!mission.is_open) return interaction.reply({ content: "Cette mission n'est plus ouverte aux candidatures.", ephemeral: true });


        // Check if the user has already reacted to the message
        const is_react_mission = await LogMissions.findOne({ where: { mission_id: mission.id, user_id: interaction.user.id } });
        if (is_react_mission) {
            const channel_details = await interaction.guild.channels.fetch(is_react_mission.channel_details);
            const detail_mission = await channel_details.messages.fetch().then(messages => {return messages.at(-1)});
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Mission complète")
                    .setURL(detail_mission.url)
                    .setStyle(ButtonStyle.Link)
            );
            return interaction.reply({ content: `Revoici le bouton pour accéder à l'entièreté de la mission.`, components: [row], ephemeral: true });
        }


        // Get the detail mission of the channel staff
        const channel_staff = await interaction.guild.channels.fetch(mission.channel_staff_id);
        const detail_mission_staff = await channel_staff.messages.fetch().then(messages => {return messages.at(-1).content});
 
        // Create the channel with the description of the mission
        const channel = await interaction.guild.channels.fetch(channel_detail_missions).then(channel => {
            return channel.threads.create({
                name: `${interaction.member.displayName} ${mission.id}`,
                type: ChannelType.PrivateThread,
            })
        });
        const row_detail = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Accepter la mission")
                .setCustomId(`mission_accept`)
                .setStyle(ButtonStyle.Success)
        );
        const detail_mission = await channel.send({ 
            content: `### ${interaction.member}, voici tous les détails concernant la mission ${mission.id}.\n\n${detail_mission_staff}\n\n**Souhaitez-vous confirmer définitivement votre candidature à cette mission ?**`,
            components: [row_detail]
        });

        // Add the user to the database
        const user_name = interaction.member.displayName.split("_");
        try {
            LogMissions.upsert({
                mission_id: mission.id,
                channel_details: channel.id,
                user_id: interaction.user.id,
                first_name: user_name[0],
                last_name: user_name[1],
                is_react_main_msg: is_react_main_msg,
            });
        } catch (error) {
            console.error("mission_interested.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'ajout de votre réponse dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Mission complète")
                .setURL(detail_mission.url)
                .setStyle(ButtonStyle.Link)
        );

        return interaction.reply({
            content: "Le fait que vous êtes intéressé par cette mission a bien été pris en compte.\n" +
            `Vous trouverez ci dessous le bouton vous permettant d'accéder à l'entièreté de la mission où vous pourrez y déposer votre candidature.`,
            components: [row],
            ephemeral: true });
    },
};

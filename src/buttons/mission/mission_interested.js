const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { channel_all_missions, channel_detail_missions } = require(process.env.CONST);
const { Members, Missions, LogMissions } = require("../../dbObjects");

/**
 * Come from src/buttons/mission/mission_send.js
 */

module.exports = {
    data: {
        name: "mission_interested",
    },
    async execute(interaction) {
        // Check if the user is in the database
        const member = await Members.findOne({ where: { member_id: interaction.user.id } });
        if (!member) return interaction.reply({ content: "Tu n'es pas dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        // Get the mission from the database
        let is_react_main_msg = interaction.channel.id === channel_all_missions;
        const mission_id = interaction.message.embeds[0].footer.text.split(" ")[1];
        const mission = await Missions.findOne({ where: { id: mission_id } });
        if (!mission) return interaction.editReply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });


        // Check if the user has already reacted to the message
        const is_react_mission = await LogMissions.findOne({ where: { mission_id: mission.id, user_id: interaction.user.id } });
        if (is_react_mission && !is_react_mission.is_delete) {
            const channel_details = await interaction.guild.channels.fetch(is_react_mission.channel_details);
            const detail_mission = await channel_details.messages.fetch().then(messages => { return messages.at(-1) });
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Mission complète")
                    .setURL(detail_mission.url)
                    .setStyle(ButtonStyle.Link)
            );
            return interaction.editReply({ content: `Revoici le bouton pour accéder à l'entièreté de la mission.`, components: [row], ephemeral: true });
        }
        if (!mission.is_open) return interaction.editReply({ content: "Cette mission n'est plus ouverte aux candidatures.", ephemeral: true });


        // Get the detail mission of the channel staff
        console.log(`Id mission: ${mission_id} - Id member: ${interaction.user.id} - Id salon staff mission: ${mission.channel_staff_id}`);
        const channel_staff = await interaction.guild.channels.fetch(mission.channel_staff_id);
        const detail_mission_staff = await channel_staff.messages.fetch().then(messages => { return messages.at(-1).content });

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

        await channel.send({ content: `### Voici tous les détails concernant la mission ${mission.id}.\n_ _` });
        const detail_mission = await channel.send({ content: detail_mission_staff });
        await channel.send({
            content: `_ _\n**Souhaitez-vous confirmer définitivement votre candidature à cette mission ?**`,
            components: [row_detail]
        });
        await channel.send({ content: `${interaction.member}, c'est dans ce salon pour le détail de la mission.` });
        await channel.messages.fetch().then(messages => { return messages.first().delete() });

        // Add the user to the database
        const user_name = interaction.member.displayName.split("_");
        try {
            if (is_react_mission && is_react_mission.is_delete) {
                await is_react_mission.destroy();
            }
            LogMissions.upsert({
                mission_id: mission.id,
                mission_name: mission.name,
                channel_details: channel.id,
                user_id: interaction.user.id,
                first_name: user_name[0],
                last_name: user_name[1],
                is_accepted: false,
                is_react_main_msg: is_react_main_msg,
                is_delete: false,
            });
        } catch (error) {
            console.error("mission_interested.js - " + error);
            return interaction.editReply({ content: "Une erreur est survenue lors de l'ajout de votre réponse dans la base de donnée.\nVeuillez contacter un admin du serveur discord.", ephemeral: true });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Mission complète")
                .setURL(detail_mission.url)
                .setStyle(ButtonStyle.Link)
        );

        return interaction.editReply({
            content: "Le fait que vous êtes intéressé par cette mission a bien été pris en compte.\n" +
                `Vous trouverez ci dessous le bouton vous permettant d'accéder à l'entièreté de la mission où vous pourrez y déposer votre candidature.`,
            components: [row],
            ephemeral: true
        });
    },
};

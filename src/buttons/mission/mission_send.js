const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Missions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_send",
    },
    async execute(interaction) {
        const missionEmbed = interaction.message.embeds[0];
        const is_particular = interaction.message.content.includes(" et dans ");

        // Get the channel_staff of the mission
        const channel_staff_id = interaction.message.content.split(" : ")[1].split("<#")[1].split(">")[0];
        const channelStaffUsed = await Missions.findOne({ where: { channel_staff_id: channel_staff_id } });
        if (channelStaffUsed) return interaction.reply({ content: `Le salon staff de la mission est déjà utilisé par la mission ${channelStaffUsed.id}.`, ephemeral: true });


        // Get the mission channels from the message
        const step1 = interaction.message.content.split("<#");
        const main_channel = await interaction.guild.channels.fetch(step1[1].split(">")[0]);
        let particular_channel, role;
        if (is_particular) {
            particular_channel = await interaction.guild.channels.fetch(step1[2].split(">")[0]);
            
            // Get the role from the particular channel
            const nameBrut = particular_channel.name.slice(9);
            const name = nameBrut.replace('-', ' ');
            const role_fetch = await interaction.guild.roles.fetch();
            role = await role_fetch.find(role => role.name.toLowerCase() == name);
        }


        // Create the button row
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("mission_interested")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Je suis intéressé")
            );

        // Send the embed mission
        const main_msg = await main_channel.send({ components: [buttonRow], embeds: [missionEmbed] });
        let particular_msg;
        if (is_particular) {
            particular_msg = await particular_channel.send({ 
                content: `${role}, voici une nouvelle mission qui pourrait vous intéresser :`,
                components: [buttonRow],
                embeds: [missionEmbed],
            });
        }

        // Add the mission to the database
        let mission;
        try {
            if (is_particular) {
                mission = await Missions.create({
                    main_msg_id: main_msg.id,
                    particular_msg_id: particular_msg.id,
                    channel_particular_id: particular_channel.id,
                    channel_staff_id: channel_staff_id,
                });
            } else {
                mission = await Missions.create({
                    main_msg_id: main_msg.id,
                    channel_staff_id: channel_staff_id,
                });
            }
        } catch (error) {
            console.error("mission_send.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de la mission dans la base de donné. De ce fait, les logs de cette mission ne pourront pas être enregistré.", ephemeral: true });
        }

        // Change the footer of the embed with the mission id
        const newEmbed = new EmbedBuilder(missionEmbed)
            .setFooter({ text: `Id: ${mission.id}`, iconURL: interaction.guild.iconURL() })

        await main_msg.edit({ embeds: [newEmbed] });
        if (is_particular) {
            await particular_msg.edit({ embeds: [newEmbed] });
        }

        // Change the channel staff name with the id of the mission
        const channel_staff = await interaction.guild.channels.fetch(channel_staff_id);
        try {
            if (channel_staff.name !== `Mission ${mission.id}`) {
                await channel_staff.setName(`Mission ${mission.id}`);
            }
        } catch (error) {
            console.error("mission_send.js - " + error);
            return interaction.reply({ content: `Une erreur est survenue lors du changement du nom du channel staff. De ce fait, vous devez changer manuellement le nom du salon ${channel_staff} avec \`Mission ${mission.id}\`.`, ephemeral: true });
        }

        return interaction.reply({ content: "La mission a bien été publiée.", ephemeral: true });
    }
};
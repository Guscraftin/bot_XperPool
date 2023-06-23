const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Missions } = require("../../dbObjects");

module.exports = {
    data: {
        name: "mission_send",
    },
    async execute(interaction) {
        const missionEmbed = interaction.message.embeds[0];
        const is_particular = interaction.message.content.includes(" et dans ");

        // Get the mission channels from the message
        const step1 = interaction.message.content.split("<#");
        const main_channel = await interaction.guild.channels.fetch(step1[1].split(">")[0]);
        let particular_channel, role;
        if (is_particular) {
            particular_channel = await interaction.guild.channels.fetch(step1[2].split(">")[0]);
            
            // Get the role from the particular channel
            const name = particular_channel.name.split("-")[1];
            const role_fetch = await interaction.guild.roles.fetch();
            role = role_fetch.find(role => role.name.toLowerCase() == name);
        }

        // Get the url of the mission
        const url = interaction.message.content.split(" : ")[1];

        // Create the button row
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("mission_interested")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Je suis intéressé")
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("mission_not_interested")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Je ne suis pas intéressé")
            );

        // Send the embed mission
        const main_msg = await main_channel.send({ components: [buttonRow], embeds: [missionEmbed] });
        let particular_msg;
        if (is_particular) {
            particular_msg = await particular_channel.send({ 
                content: `${role.toString()}, voici une nouvelle mission qui pourrait vous intéresser :`,
                components: [buttonRow],
                embeds: [missionEmbed],
            });
        }

        // Add the mission to the database
        try {
            if (is_particular) {
                await Missions.create({
                    main_msg_id: main_msg.id,
                    particular_msg_id: particular_msg.id,
                    url: url,
                });
            } else {
                await Missions.create({
                    main_msg_id: main_msg.id,
                    url: url,
                });
            }
        } catch (error) {
            console.error("mission_send.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de la mission dans la base de donné. De ce fait, les logs de cette mission ne pourront pas être enregistré.", ephemeral: true });
        }

        return interaction.reply({ content: "La mission a bien été publiée.", ephemeral: true });
    }
};
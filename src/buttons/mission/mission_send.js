const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Communities, Missions } = require("../../dbObjects");

/**
 * Come from src/commands/admin/mission.js
 */

module.exports = {
    data: {
        name: "mission_send",
    },
    async execute(interaction) {
        const missionEmbed = interaction.message.embeds[0];
        const is_particular = interaction.message.content.includes("Et dans ");

        await interaction.deferReply({ ephemeral: true });

        // Get the channel_staff of the mission
        const channel_staff_id = interaction.message.content.split(" : ")[1].split("<#")[1].split(">")[0];
        const channelStaffUsed = await Missions.findOne({ where: { channel_staff_id: channel_staff_id } });
        if (channelStaffUsed) return interaction.editReply({ content: `Le salon staff de la mission est déjà utilisé par la mission ${channelStaffUsed.id}.`, ephemeral: true });

        // Create the button row
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("mission_interested")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Je suis intéressé")
            );

        // Get the mission channels from the message
        const step1 = interaction.message.content.split("\n");
        const main_channel = await interaction.guild.channels.fetch(step1[0].split("<#")[1].split(">")[0]);

        let particulars_msg_id = [];
        let particulars_channel = [];
        if (is_particular) {
            const step2 = step1[1].split("<#");
            const lengthChannel = step2.length;
            particulars_channel.push(step2[1].split(">")[0]);
            if (lengthChannel > 2) particulars_channel.push(step2[2].split(">")[0]);
            if (lengthChannel > 3) particulars_channel.push(step2[3].split(">")[0]);

            const role_fetch = await interaction.guild.roles.fetch();
            for (const channel of particulars_channel) {
                async function processChannel() {
                    const particular_channel = await interaction.guild.channels.fetch(channel);
                    const community = await Communities.findOne({ where: { channel_mission_id: channel } });
                    if (!community) return interaction.editReply({ content: "Une erreur est survenue lors de la récupération de la communauté.", ephemeral: true });
                    const role = await interaction.guild.roles.fetch(community.role_id);
                    if (!role) return interaction.editReply({ content: "Une erreur est survenue lors de la récupération du rôle.", ephemeral: true });

                    const particular_msg = await particular_channel.send({
                        content: `${role}, voici une nouvelle mission qui pourrait vous intéresser :`,
                        components: [buttonRow],
                        embeds: [missionEmbed],
                    });

                    particulars_msg_id.push(particular_msg.id);
                }
                await processChannel();
            }
        }

        // Send the embed mission
        const main_msg = await main_channel.send({ components: [buttonRow], embeds: [missionEmbed] });

        // Add the mission to the database
        let mission;
        try {
            if (is_particular) {
                mission = await Missions.create({
                    main_msg_id: main_msg.id,
                    particulars_msg_id: particulars_msg_id,
                    channel_particulars_id: particulars_channel,
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
            return interaction.editReply({ content: "Une erreur est survenue lors de l'enregistrement de la mission dans la base de donné. De ce fait, les logs de cette mission ne pourront pas être enregistré.", ephemeral: true });
        }

        // Change the footer of the embed with the mission id
        const newEmbed = new EmbedBuilder(missionEmbed)
            .setFooter({ text: `Id: ${mission.id}`, iconURL: interaction.guild.iconURL() })

        await main_msg.edit({ embeds: [newEmbed] });
        if (is_particular) {
            particulars_channel.forEach(async (channel) => {
                const particular_channel = await interaction.guild.channels.fetch(channel);
                const particular_msg = await particular_channel.messages.fetch(await particulars_msg_id[particulars_channel.indexOf(channel)]);
                await particular_msg.edit({ embeds: [newEmbed] });
            });
        }

        return interaction.editReply({ content: "La mission a bien été publiée.", ephemeral: true });
    }
};
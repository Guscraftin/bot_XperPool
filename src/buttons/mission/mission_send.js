const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "mission_send",
    },
    async execute(interaction) {
        const missionEmbed = interaction.message.embeds[0];

        // Get the mission channels from the message
        const step1 = interaction.message.content.split("<#");
        const main_channel = await interaction.guild.channels.fetch(step1[1].split(">")[0]);
        const particular_channel = await interaction.guild.channels.fetch(step1[2].split(">")[0]);

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
        const particular_msg = await particular_channel.send({ components: [buttonRow], embeds: [missionEmbed] });

        const { text: footer_text, iconURL: footer_url } = missionEmbed.footer;
        const main_embed = new EmbedBuilder()
            .setTitle(missionEmbed.title)
            .setDescription(missionEmbed.description)
            .setColor(missionEmbed.color)
            .setFields(missionEmbed.fields)
            .setTimestamp()
            .setFooter({ text: `${footer_text} - ${particular_msg.id}`, iconURL: footer_url });

        const main_msg = await main_channel.send({ components: [buttonRow], embeds: [main_embed] });
        const particular_embed = new EmbedBuilder()
            .setTitle(missionEmbed.title)
            .setDescription(missionEmbed.description)
            .setColor(missionEmbed.color)
            .setFields(missionEmbed.fields)
            .setTimestamp()
            .setFooter({ text: `${footer_text} - ${main_msg.id}`, iconURL: footer_url });
        await particular_msg.edit({ embeds: [particular_embed] })

        return interaction.reply({ content: "La mission a bien été publiée.", ephemeral: true });
    }
};
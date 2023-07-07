const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { Communities } = require("../../dbObjects");

/**
 * Come from src/commands/admin/admincommu.js
 * And src/buttons/commu/commu_next.js and src/buttons/commu/commu_previous.js
 */

module.exports = {
    data: {
        name: "commu_next",
    },
    async execute(interaction) {
        try {
            // Get information about the commu
            const oldEmbed = interaction.message.embeds[0];
            const currentPage = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[0]);
            const pageCount = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[1]);

            // Recovering constants
            const pageSize = 10;
            const communities = await Communities.findAll({ order: [['name', 'ASC']] });

            // Displaying the next page of the commu
            const nextPage = currentPage + 1;
            const startIndex = (nextPage - 1) * pageSize;
            const endIndex = nextPage * pageSize;
            const commuPage = communities.slice(startIndex, endIndex);

            // Display the commu
            let fields = [];
            commuPage.forEach(({ category_id, role_id, channel_mission_id }) => {
                fields.push({ name: `Id: ${category_id}`, value: `<#${category_id}>\n<@&${role_id}>・<#${channel_mission_id}>` });
            });
            let embed = new EmbedBuilder()
                .setTitle(oldEmbed.title)
                .setDescription(oldEmbed.description)
                .setFields(fields)
                .setColor(oldEmbed.color)
                .setFooter({ text: `Page ${nextPage}/${pageCount}`});

            // Displaying the navigation buttons
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("commu_previous")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(nextPage === 1),
                    new ButtonBuilder()
                        .setCustomId("commu_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(nextPage === pageCount)
                );

            return interaction.update({ embeds: [embed], components: [navigationRow], ephemeral: true });
        } catch (error) {
            console.error("commu_next.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage de la liste.", ephemeral: true });
        }
    }
}
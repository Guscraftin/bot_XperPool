const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Items } = require("../../dbObjects");

module.exports = {
    data: {
        name: "shop_next",
    },
    async execute(interaction) {
        try {
            // Get information about the shop
            const oldEmbed = interaction.message.embeds[0];
            const memberScore = oldEmbed.footer.text.split("•")[1];
            const currentPage = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[0]);
            const pageCount = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[1]);

            // Recovering constants
            const pageSize = 10;
            const items = await Items.findAll();

            // Displaying the next page of the shop
            const nextPage = currentPage + 1;
            const startIndex = (nextPage - 1) * pageSize;
            const endIndex = nextPage * pageSize;
            const shopPage = items.slice(startIndex, endIndex);

            // Display the shop
            let embed = new EmbedBuilder()
                .setTitle(oldEmbed.title)
                .setDescription(oldEmbed.description)
                .setColor(oldEmbed.color)
                .setFooter({ text: `Page ${nextPage}/${pageCount} •${memberScore}`});

            let fields = [];
            shopPage.forEach(({ name, description, price }) => {
                fields.push({ name: `${name} (${price} score)`, value: description });
            });
            embed.addFields(fields);

            // Displaying the navigation buttons
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("shop_previous")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(nextPage === 1),
                    new ButtonBuilder()
                        .setCustomId("shop_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(nextPage === pageCount)
                );

            return interaction.update({ embeds: [embed], components: [navigationRow], ephemeral: true });
        } catch (error) {
            console.error("shop_next.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage de la boutique.", ephemeral: true });
        }
    }
}
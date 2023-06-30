const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Items, Members } = require('../../dbObjects');
const { color_basic } = require(process.env.CONST);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boutique")
        .setDescription("Afficher la boutique.")
        .setDMPermission(false),
    async execute(interaction) {
        try {
            // Get items of the shop
            const items = await Items.findAll();
            if (!items.length) return interaction.reply({ content: "Aucun article est en vente.", ephemeral: true });

            // Get the score of the member who used the command
            const member = await Members.findOne({ where: { member_id: interaction.member.id } });
            const memberScore = member ? member.score : 0;

            // Division of items into groups of 10 for each page
            const pageSize = 10;
            const pageCount = Math.ceil(items.length / pageSize);

            // Displaying the first page of the shop
            const currentPage = 1;
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = currentPage * pageSize;
            const shopPage = items.slice(startIndex, endIndex);

            // Display the shop
            let embed = new EmbedBuilder()
                .setTitle("Boutique")
                .setDescription("Voici les articles disponibles à l'achat.")
                .setColor(color_basic)
                .setFooter({ text: `Page ${currentPage}/${pageCount} • Ton score: ${memberScore}` });

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
                        .setDisabled(currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId("shop_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === pageCount)
                );

            return interaction.reply({ embeds: [embed], components: [navigationRow], ephemeral: true });



        } catch (error) {
            console.error("boutique.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage de la boutique.", ephemeral: true });
        }
    },
};
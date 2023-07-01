const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Items, Members } = require('../../dbObjects');
const { color_basic, role_admins } = require(process.env.CONST);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boutique")
        .setDescription("Afficher la boutique.")
        .setDMPermission(false),
    async execute(interaction) {

        // Get items of the shop
        let items, memberScore, isMember;
        try {
            items = await Items.findAll();
            if (!items.length) return interaction.reply({ content: "Aucun article est en vente.", ephemeral: true });

            // Get the score of the member who used the command
            const member = await Members.findOne({ where: { member_id: interaction.member.id } });
            isMember = member ? true : false;
            memberScore = member ? member.score : 0;
        } catch (error) {
            console.error("boutique.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage de la boutique.", ephemeral: true });
        }

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
        let selectMenuOptions = [];
        shopPage.forEach(({ id, name, description, price }) => {
            // Add the id of the item to the select menu for admin users
            if (isMember && interaction.member.roles.cache.has(role_admins)) fields.push({ name: `${id}・${name} (${price} score)`, value: description });
            else fields.push({ name: `${name} (${price} score)`, value: description });
            selectMenuOptions.push(new StringSelectMenuOptionBuilder().setLabel(name).setValue(name).setDescription(`${price} score`));
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

        // Create the select menu to buy an item on the shop
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("shop_buy")
            .setPlaceholder("Choisissez un article à acheter...")
            .setMaxValues(1)
            .setOptions(selectMenuOptions)


        const buyRow = new ActionRowBuilder()
            .addComponents(selectMenu);

        return interaction.reply({ embeds: [embed], components: [buyRow, navigationRow], ephemeral: true });
    },
};
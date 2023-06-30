const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Items, Members } = require('../../dbObjects');
const { color_basic, channel_staff, role_admins } = require(process.env.CONST);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boutique")
        .setDescription("Afficher la boutique.")
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName("afficher")
                .setDescription("Afficher la boutique."))
        .addSubcommand(subcommand =>
            subcommand
                .setName("acheter")
                .setDescription("Acheter un article.")
                .addIntegerOption(option =>
                    option.setName("id").setDescription("L'id de l'article à acheter.").setMinValue(1).setRequired(true))),
    async execute(interaction) {
        
        let memberScore;
        switch (interaction.options.getSubcommand()) {            

            /**
             * Display the shop
             */
            case "afficher":
                // Get items of the shop
                let items;
                try {
                    items = await Items.findAll();
                    if (!items.length) return interaction.reply({ content: "Aucun article est en vente.", ephemeral: true });

                    // Get the score of the member who used the command
                    const member = await Members.findOne({ where: { member_id: interaction.member.id } });
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

            /**
             * Buy an item
             * @param {number} id - The id of the item to buy
             * @returns {Promise<Message>} - The message sent by the bot
             */
            case "acheter":
                // Get the item to buy
                const id = interaction.options.getInteger("id");
                const item = await Items.findOne({ where: { id: id } });
                if (!item) return interaction.reply({ content: "L'article que tu souhaites acheter n'existe pas.", ephemeral: true });

                // Get the score of the member who used the command
                const member = await Members.findOne({ where: { member_id: interaction.member.id } });
                memberScore = member ? member.score : 0;

                // Check if the member has enough score to buy the item
                if (memberScore < item.price) return interaction.reply({ content: "Tu n'as pas assez de score pour acheter cet article.", ephemeral: true });

                // Send message to staff channel
                const staffChannel = await interaction.guild.channels.fetch(channel_staff).catch(() => null);
                if (!staffChannel) return interaction.reply({ content: "Votre achat a été annulé car nous n'avons pas pu envoyer de confirmation. Veuillez contacter un admin pour obtenir de l'assistance.", ephemeral: true });
                await staffChannel.send(`<@&${role_admins}>, ${interaction.member} a acheté l'article \`${item.id}\` nommé \`${item.name}\` pour \`${item.price}\` score.`);

                // Update the score of the member
                try {
                    await Members.update({ score: memberScore - item.price }, { where: { member_id: interaction.member.id } });
                } catch (error) {
                    console.error("boutique.js buy updt - " + error);
                    return interaction.reply({ content: "Une erreur est survenue lors de l'achat de l'article.", ephemeral: true });
                }

                // Send confirmation message
                return interaction.reply({ content: `Tu as acheté l'article \`${item.id}\` nommé \`${item.name}\` pour \`${item.price}\` score.`, ephemeral: true });

            default:
                return interaction.reply({ content: "La subcommand est introuvable.", ephemeral: true });

        }
    },
};
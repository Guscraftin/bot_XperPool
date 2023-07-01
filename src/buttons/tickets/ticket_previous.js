const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { Tickets } = require("../../dbObjects");

module.exports = {
    data: {
        name: "ticket_previous",
    },
    async execute(interaction) {
        try {
            // Get information about the shop
            const oldEmbed = interaction.message.embeds[0];
            const description = oldEmbed.description;
            const currentPage = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[0]);
            const pageCount = parseInt(oldEmbed.footer.text.split(" ")[1].split("/")[1]);
            let member, category;
            if (description.includes("Membre")) {
                member = description.split("**Membre :** ")[1].split("\n")[0].split("<@")[1].split(">")[0];
            }
            if (description.includes("Catégorie")) {
                category = description.split("**Catégorie :** ")[1].split("\n")[0];
            }

            // Recovering constants
            const pageSize = 10;
            let tickets;
            try {
                if (member && category) tickets = await Tickets.findAll({ where: { user_id: member, category: category } }); 
                else if (member) tickets = await Tickets.findAll({ where: { user_id: member } });
                else if (category) tickets = await Tickets.findAll({ where: { category: category } });
                else tickets = await Tickets.findAll();
            } catch (error) {
                console.error("adminticket list - " + error);
            }
            if (!tickets || tickets.length == 0) return interaction.reply({ content: `Aucune retranscription de ticket n'a été trouvée.`, ephemeral: true });

            // Displaying the next page of the ticket
            const previousPage = currentPage - 1;
            const startIndex = (previousPage - 1) * pageSize;
            const endIndex = previousPage * pageSize;
            const ticketPage = tickets.slice(startIndex, endIndex);

            // Display the ticket
            let fields = [];
            ticketPage.forEach(({ id, user_id, category }) => {
                fields.push({ name: `Id: ${id}`, value: `<@${user_id}> -> ${category}` });
            });

            let embed = new EmbedBuilder()
                .setTitle(oldEmbed.title)
                .setDescription(oldEmbed.description)
                .setFields(fields)
                .setColor(oldEmbed.color)
                .setFooter({ text: `Page ${previousPage}/${pageCount}`});


            // Displaying the navigation buttons
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket_previous")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(previousPage === 1),
                    new ButtonBuilder()
                        .setCustomId("ticket_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(previousPage === pageCount)
                );

            return interaction.update({ embeds: [embed], components: [navigationRow], ephemeral: true });
        } catch (error) {
            console.error("ticket_next.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage des tickets.", ephemeral: true });
        }
    }
}
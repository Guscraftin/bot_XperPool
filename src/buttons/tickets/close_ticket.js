const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Come from src/selectMenus/tickets/open_ticket_reason.js
 */

module.exports = {
    data: {
        name: "close_ticket",
    },
    async execute(interaction) {
        // Create a button to confirm the closing of the ticket
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_close_ticket")
                    .setLabel("Confirmer la fermeture")
                    .setStyle(ButtonStyle.Danger)
            );

        return interaction.reply({ content: "Est-ce que nous avons répondu à toutes vos questions ? Si c'est le cas, vous pouvez confirmer la fermeture de ce ticket.", components: [ row ] });
    }
}
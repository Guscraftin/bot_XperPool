const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { color_basic } = require(process.env.CONST);

module.exports = {
    data: {
        name: "panel_ticket",
    },
    async execute(interaction) {
        // Create the select menu for the reasons
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("open_ticket_reason")
                    .setPlaceholder("Sélectionnez une raison...")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Signaler un membre")
                            .setValue("Signaler un membre"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Problème sur une mission")
                            .setValue("Problème sur une mission"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Bug serveur")
                            .setValue("Bug serveur"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Question générale")
                            .setValue("Question générale"),
                    ),
            );

        // Create the embed in the ticket channel
        const embed = new EmbedBuilder()
            .setDescription("**Merci de sélectionner la raison de votre ticket.**")
            .setColor(color_basic)
        
        return interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
    }
}
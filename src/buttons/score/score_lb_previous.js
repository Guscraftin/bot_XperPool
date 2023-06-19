const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Members } = require("../../dbObjects");

module.exports = {
    data: {
        name: "score_lb_previous",
    },
    async execute(interaction) {
        try {
            // Get information about the leaderboard
            const memberRank = interaction.message.embeds[0].footer.text.split("•")[1];
            const currentPage = parseInt(interaction.message.embeds[0].footer.text.split(" ")[1].split("/")[0]);
            const pageCount = parseInt(interaction.message.embeds[0].footer.text.split(" ")[1].split("/")[1]);

            // Recovering constants
            const pageSize = 10;
            const users = await Members.findAll({ order: [['score', 'DESC']] });

            // Displaying the previous page of the leaderboard
            const previousPage = currentPage - 1;
            const startIndex = (previousPage - 1) * pageSize;
            const endIndex = previousPage * pageSize;
            const leaderboardPage = users.slice(startIndex, endIndex);

            // Display the leaderboard
            const embed = new EmbedBuilder()
                .setTitle("Classement")
                .setDescription(leaderboardPage.map((user, index) => `**${startIndex + index + 1}.** <@${user.member_id}> ▸ ${user.score}`).join("\n"))
                .setFooter({ text: `Page ${previousPage}/${pageCount} •${memberRank}`});

            // Displaying the navigation buttons
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("score_lb_previous")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(previousPage === 1),
                    new ButtonBuilder()
                        .setCustomId("score_lb_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(previousPage === pageCount)
                );

            return interaction.update({ embeds: [embed], components: [navigationRow], ephemeral: true });
        } catch (error) {
            console.error("score_lb_previous.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage du classement.", ephemeral: true });
        }
    }
}
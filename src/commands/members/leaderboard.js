const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Members } = require('../../dbObjects');
const {color_basic } = require(process.env.CONST);

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Afficher le classement des plus actif.")
        .setDMPermission(false),
	async execute(interaction) {
        try {
            // Get users ranked by score
            const users = await Members.findAll({ order: [['score', 'DESC']] });
            if (!users.length) return interaction.reply({ content: "Aucun utilisateur n'a encore participé.", ephemeral: true });
            
            // Get the rank of the member who used the command
            const memberRank = users.findIndex(user => user.member_id === interaction.member.id) + 1;

            // Division of users into groups of 10 for each page
            const pageSize = 10;
            const pageCount = Math.ceil(users.length / pageSize);

            // Displaying the first page of the leaderboard
            const currentPage = 1;
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = currentPage * pageSize;
            const leaderboardPage = users.slice(startIndex, endIndex);

            // Display the leaderboard
            const embed = new EmbedBuilder()
                .setTitle("Classement")
                .setDescription(leaderboardPage.map((user, index) => `**${startIndex + index + 1}.** <@${user.member_id}> ▸ ${user.score}`).join("\n"))
                .setColor(color_basic)
                .setFooter({ text: `Page ${currentPage}/${pageCount} • Ton rang: ${memberRank}/${users.length}`});

            // Displaying the navigation buttons
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("score_lb_previous")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId("score_lb_next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === pageCount)
                );

            return interaction.reply({ embeds: [embed], components: [navigationRow], ephemeral: true });
        } catch (error) {
            console.error("leaderboard.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'affichage du classement.", ephemeral: true });
        }
    },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize');
const { Members } = require('../../dbObjects');
const { color_basic } = require(process.env.CONST);

module.exports = {
	data: new SlashCommandBuilder()
		.setName("score")
		.setDescription("Affiche le score d'un membre.")
        .setDMPermission(false)
        .addUserOption(option => option.setName('membre').setDescription("Le membre ou l'id du membre dont afficher le score.")),
	async execute(interaction) {
        try {
            const member = interaction.options.getUser("membre") || interaction.user;
            const user = await Members.findOne({ where: { member_id: member.id } });
            if (!user) return interaction.reply({ content: "Ce membre n'a pas de score.", ephemeral: true });
            const totalMembers = await Members.count();
            const rank = await Members.count({ where: { score: { [Op.gt]: user.score } } }) + 1;

            const embed = new EmbedBuilder()
                .setTitle(`Stats de ${member.username}`)
                .setDescription(`Score : \`${user.score}\`\n`+
                `Rang : \`${rank}/${totalMembers}\``)
                .setColor(color_basic);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("score.js - " + error);
        }
	},
};
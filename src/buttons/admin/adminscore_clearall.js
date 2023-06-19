const { Members } = require("../../dbObjects");

module.exports = {
    data: {
        name: "adminscore_clearall",
    },
    async execute(interaction) {
        try {
            // Reset all score to 0
            await Members.update({ score: 0 }, { where: {} });
            return interaction.reply({ content: "Le score de tous les membres a été réinitialisé à \`0\`.", ephemeral: true });
        } catch (error) {
            console.error("adminscore_clearall.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la réinitialisation du score de tous les membres.", ephemeral: true });
        }
    }
}
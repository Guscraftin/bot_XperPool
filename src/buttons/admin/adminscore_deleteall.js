const { Members } = require("../../dbObjects");

module.exports = {
    data: {
        name: "adminscore_deleteall",
    },
    async execute(interaction) {
        try {
            // Delete all members
            await Members.destroy({ where: {} });
            return interaction.reply({ content: "Tous les membres ont été supprimés de la base de donnée.", ephemeral: true });
        } catch (error) {
            console.error("adminscore_deleteall.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la suppression de tous les membres de la base de donnée.", ephemeral: true });
        }
    }
}
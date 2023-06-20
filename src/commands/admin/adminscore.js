const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Members } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adminscore")
	    .setDescription("🔧 Permet de modifier la db des membres.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("🔧 Ajouter du score à un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre auquel ajouter le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à ajouter.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription("🔧 Retirer du score à un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre auquel supprimer le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à retirer.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription("🔧 Définir le score d'un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre auquel définir le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à mettre.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription("🔧 Supprimer le score d'un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre auquel supprimer le score.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clearall')
                .setDescription("🔧 Supprimer le score de tous les membres."))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deleteall')
                .setDescription("🔧 Supprimer tous les membres de la base de donnée.")),
    async execute(interaction) {
        try {
            const member = interaction.options.getUser("membre");
            const score = interaction.options.getInteger("score");

            let user;
            if (member) {
                // Check if member is a bot
                if (member.bot) return interaction.reply({ content: "Vous ne pouvez pas modifier le score d'un bot.", ephemeral: true });

                // Check if member exists in db
                user = await Members.findOne({ where: { member_id: member.id } });
                if (!user) {
                    user = [
                        Members.upsert({ member_id: member.id}),
                    ];
                
                    await Promise.all(user);
                }
            }
            
            let newScore;
            let deleteEmbed;
            switch (interaction.options.getSubcommand()) {
                case "add":
                    newScore = user.score + score;
                    await Members.update({ score: newScore }, { where: { member_id: member.id } });
                    return interaction.reply({ content: `Le score de ${member} a été augmenté à \`${newScore}\`.`, ephemeral: true });

                case "remove":
                    newScore = user.score - score;
                    if (newScore < 0) newScore = 0;
                    await Members.update({ score: newScore }, { where: { member_id: member.id } });
                    return interaction.reply({ content: `Le score de ${member} a été diminué à \`${newScore}\`.`, ephemeral: true });

                case "set":
                    await Members.update({ score: score }, { where: { member_id: member.id } });
                    return interaction.reply({ content: `Le score de ${member} a été défini à \`${score}\`.`, ephemeral: true });

                case "clear":
                    await Members.update({ score: 0 }, { where: { member_id: member.id } });
                    return interaction.reply({ content: `Le score de ${member} a été réinitialisé à \`0\`.`, ephemeral: true });
                    
                case "clearall":
                    deleteEmbed = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("adminscore_clearall")
                            .setLabel("Oui ▸ Supprimer définitivement")
                            .setEmoji("🚨")
                            .setStyle(ButtonStyle.Secondary)
                        );
                    
                    return interaction.reply({ content: "Voulez-vous vraiment supprimer des données de la base de données ?", components: [deleteEmbed], ephemeral: true });

                case "deleteall":
                    deleteEmbed = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("adminscore_deleteall")
                            .setLabel("Oui ▸ Supprimer définitivement")
                            .setEmoji("🚨")
                            .setStyle(ButtonStyle.Secondary)
                        );

                    return interaction.reply({ content: "Voulez-vous vraiment supprimer des données de la base de données ?", components: [deleteEmbed], ephemeral: true });
                default:
                    return interaction.reply({ content: "Cette action n'existe pas.", ephemeral: true });
        }} catch (error) {
            console.error("adminscore.js - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'exécution de la commande.", ephemeral: true });
        }
    },
};
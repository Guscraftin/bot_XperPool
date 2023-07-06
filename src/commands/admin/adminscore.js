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
                .addUserOption(option => option.setName('membre').setDescription("Le membre ou l'id du membre auquel ajouter le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à ajouter.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription("🔧 Retirer du score à un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre ou l'id du membre auquel supprimer le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à retirer.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription("🔧 Définir le score d'un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre ou l'id du membre auquel définir le score.").setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription("Le score à mettre.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription("🔧 Supprimer le score d'un membre.")
                .addUserOption(option => option.setName('membre').setDescription("Le membre ou l'id du membre auquel supprimer le score.").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clearall')
                .setDescription("🔧 Supprimer le score de tous les membres."))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deleteall')
                .setDescription("🔧 Supprimer tous les membres de la base de donnée.")),
    async execute(interaction) {
        const member = interaction.options.getUser("membre");
        const score = interaction.options.getInteger("score");

        let user;
        if (member) {
            // Check if member is a bot
            if (member.bot) return interaction.reply({ content: "Vous ne pouvez pas modifier le score d'un bot.", ephemeral: true });

            // Check if member exists in db
            try {
                user = await Members.findOne({ where: { member_id: member.id } });
                if (!user) {
                    user = [
                        Members.upsert({ member_id: member.id}),
                    ];
                
                    await Promise.all(user);
                }
            } catch (error) {
                console.error("adminscore find - " + error);
                return interaction.reply({ content: "Une erreur est survenue lors de la recherche du membre dans la base de données.", ephemeral: true });
            }
        }
        
        let newScore;
        let deleteEmbed;
        switch (interaction.options.getSubcommand()) {
            /**
             * Add score to a member
             */
            case "add":
                newScore = user.score + score;
                try {
                    await Members.update({ score: newScore }, { where: { member_id: member.id } });
                } catch (error) {
                    console.error("adminscore add - " + error);
                    return interaction.reply({ content: "Une erreur est survenue lors de l'ajout du score à la base de données.", ephemeral: true });
                }
                return interaction.reply({ content: `Le score de ${member} a été augmenté à \`${newScore}\`.`, ephemeral: true });

            /**
             * Remove score to a member
             */
            case "remove":
                newScore = user.score - score;
                if (newScore < 0) newScore = 0;
                try {
                    await Members.update({ score: newScore }, { where: { member_id: member.id } });
                } catch (error) {
                    console.error("adminscore remove - " + error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la suppression du score à la base de données.", ephemeral: true });
                }
                return interaction.reply({ content: `Le score de ${member} a été diminué à \`${newScore}\`.`, ephemeral: true });

            /**
             * Set score to a member
             */
            case "set":
                try {
                    await Members.update({ score: score }, { where: { member_id: member.id } });
                } catch (error) {
                    console.error("adminscore set - " + error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la définition du score à la base de données.", ephemeral: true });
                }
                return interaction.reply({ content: `Le score de ${member} a été défini à \`${score}\`.`, ephemeral: true });

            /**
             * Clear score to a member
             */
            case "clear":
                try {
                    await Members.update({ score: 0 }, { where: { member_id: member.id } });
                } catch (error) {
                    console.error("adminscore clear - " + error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la suppression du score à la base de données.", ephemeral: true });
                }
                return interaction.reply({ content: `Le score de ${member} a été réinitialisé à \`0\`.`, ephemeral: true });
        
            /**
             * Clear score to all members
             */
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

            /**
             * Delete all members
             */
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
        
        }
    },
};
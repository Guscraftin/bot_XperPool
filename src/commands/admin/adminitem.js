const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Items } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adminitem")
	    .setDescription("🔧 Permet de modifier la db de la boutique.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("🔧 Ajouter un article à la boutique.")
                .addStringOption(option => option.setName('name').setDescription("Le nom de l'article.").setMaxLength(256).setRequired(true))
                .addStringOption(option => option.setName('description').setDescription("La description de l'article.").setMaxLength(1024).setRequired(true))
                .addIntegerOption(option => option.setName('price').setDescription("Le prix de l'article.").setMinValue(0).setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription("🔧 Mettre à jour un article.")
                .addIntegerOption(option => option.setName('id').setDescription("L'id de l'article.").setMinValue(1).setRequired(true))
                .addStringOption(option => option.setName('name').setDescription("Le nom de l'article.").setMaxLength(256))
                .addStringOption(option => option.setName('description').setDescription("La description de l'article.").setMaxLength(1024))
                .addIntegerOption(option => option.setName('price').setDescription("Le prix de l'article.").setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription("🔧 Retirer un article de la boutique.")
                .addIntegerOption(option => option.setName('id').setDescription("L'id de l'article.").setMinValue(1).setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription("🔧 Supprimer tous les articles de la boutique.")
                .addBooleanOption(option => option.setName('confirm').setDescription("Confirmer la suppression.").setRequired(true))),
    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const price = interaction.options.getInteger('price');
        const confirm = interaction.options.getBoolean('confirm');

        let item;
        switch (interaction.options.getSubcommand()) {
            /**
             * Add an item to the shop
             */
            case "add":
                try {    
                    item = await Items.create({ name: name, description: description, price: price });
                } catch (error) {
                    console.error("adminitems add - " + error);
                }
                return interaction.reply({ content: `L'article \`${item.name}\` avec l'id \`${item.id}\` a été ajouté à la boutique.`, ephemeral: true });


            /**
             * Edit an item in the shop
             */
            case "edit":
                try {
                    item = await Items.findOne({ where: { id: id } });
                    if (!item) return interaction.reply({ content: `L'article avec l'id \`${id}\` n'existe pas.`, ephemeral: true });
                    if (name) await Items.update({ name: name }, { where: { id: id } });
                    if (description) await Items.update({ description: description }, { where: { id: id } });
                    if (price) await Items.update({ price: price }, { where: { id: id } });
                } catch (error) {
                    console.error("adminitems edit - " + error);
                }
                return interaction.reply({ content: `L'article avec l'id \`${id}\` (\`${item.name}\`) a été mis à jour.`, ephemeral: true });


            /**
             * Remove an item from the shop
             */
            case "remove":
                try {
                    item = await Items.findOne({ where: { id: id } });
                    if (!item) return interaction.reply({ content: `L'article avec l'id \`${id}\` n'existe pas.`, ephemeral: true });
                    await Items.destroy({ where: { id: id } });
                } catch (error) {
                    console.error("adminitems remove - " + error);
                }
                return interaction.reply({ content: `L'article avec l'id \`${id}\` (\`${item.name}\`) a été supprimé.`, ephemeral: true });


            /**
             * Clear all items from the shop
             */
            case "clear":
                if (!confirm) return interaction.reply({ content: `Vous devez confirmer la suppression de tous les articles de la boutique.`, ephemeral: true });
                try {
                    await Items.destroy({ where: {} });
                } catch (error) {
                    console.error("adminitems clear - " + error);
                }
                return interaction.reply({ content: `Tous les articles de la boutique ont été supprimés.`, ephemeral: true });

            default:
                return interaction.reply({ content: `Cette subcommand n'existe pas.`, ephemeral: true });
        }
    },
};
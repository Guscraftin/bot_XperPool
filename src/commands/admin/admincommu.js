const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { color_basic } = require(process.env.CONST);
const { Communities } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admincommu")
        .setDescription("🔧 Permet de modifier la db des communautés.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("🔧 Ajouter une communauté dans la base de donnée.")
                .addChannelOption(option => option.setName('category').setDescription("La catégorie de la communauté.").addChannelTypes(ChannelType.GuildCategory).setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription("Le rôle de la communauté.").setRequired(true))
                .addChannelOption(option => option.setName('channel-mission').setDescription("Le channel de la communauté.").addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription("🔧 Afficher la liste des communautés dans la base de donnée."))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription("🔧 Supprimer une communauté de la base de donnée.")
                .addStringOption(option => option.setName('id').setDescription("L'id de la communauté.").setRequired(true))
                .addBooleanOption(option => option.setName('confirm').setDescription("Confirmer la suppression.").setRequired(true))),
    async execute(interaction) {
        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('role');
        const channel_mission = interaction.options.getChannel('channel-mission');
        const id = interaction.options.getString('id');
        const confirm = interaction.options.getBoolean('confirm');

        let ticket;
        switch (interaction.options.getSubcommand()) {
            /**
             * Add a community in the database
             */
            case "add":
                const findCategory = await Communities.findOne({ where: { category_id: category.id } });
                if (findCategory) return interaction.reply({ content: `La catégorie existe déjà dans la base de donnée.`, ephemeral: true });

                await Communities.create({
                    category_id: category.id,
                    name: role.name,
                    role_id: role.id,
                    channel_mission_id: channel_mission.id,
                }).catch(error => {
                    console.error("admincommu add - " + error);
                    return interaction.reply({ content: `Une erreur est survenue lors de l'ajout de la communauté.`, ephemeral: true });
                });
                return interaction.reply({ content: `La communauté a bien été ajoutée dans la base de donnée.`, ephemeral: true });    


            /**
             * List all communities in the database
             */
            case "list":

                let communities;
                communities = await Communities.findAll({ order: [['name', 'ASC']] });
                
                if (!communities || communities.length == 0) return interaction.reply({ content: `Aucune communauté n'a été trouvée dans la base de donnée.`, ephemeral: true });

                // Division of community into groups of 10 for each page
                const pageSize = 10;
                const pageCount = Math.ceil(communities.length / pageSize);

                // Displaying the first page of the community
                const currentPage = 1;
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = currentPage * pageSize;
                const commuPage = communities.slice(startIndex, endIndex);

                // Create embed fields
                let fields = [];
                commuPage.forEach(({ category_id, role_id, channel_mission_id }) => {
                    fields.push({ name: `Id: ${category_id}`, value: `<#${category_id}>\n<@&${role_id}>・<#${channel_mission_id}>` });
                });

                // Create embed
                const embed = new EmbedBuilder()
                    .setTitle(`Liste des communautés`)
                    .addFields(fields)
                    .setColor(color_basic)
                    .setTimestamp()
                    .setFooter({ text: `Page ${currentPage}/${pageCount}` })

                // Displaying the navigation buttons
                const navigationRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("commu_previous")
                            .setLabel("◀️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 1),
                        new ButtonBuilder()
                            .setCustomId("commu_next")
                            .setLabel("▶️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === pageCount)
                    );

                return interaction.reply({ embeds: [embed], components: [navigationRow], ephemeral: true });


            /**
             * Delete one community in the database
             */
            case "delete":
                if (!confirm) return interaction.reply({ content: `Vous devez confirmer la suppression de l'élément désigné.`, ephemeral: true });
                try {
                    community = await Communities.findOne({ where: { category_id: id } });
                    if (!community || community.length == 0) return interaction.reply({ content: `La communauté avec l'id \`${id}\` n'existe pas.`, ephemeral: true });
                    await community.destroy();
                } catch (error) {
                    console.error("admincommu delete - " + error);
                }
                return interaction.reply({ content: `La communauté avec l'id \`${id}\` a été supprimé de la base de donnée.`, ephemeral: true });

            default:
                return interaction.reply({ content: `Cette subcommand n'existe pas.`, ephemeral: true });
        }
    },
};
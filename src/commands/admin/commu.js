const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { Communities } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("commu")
        .setDescription("🔧 Permet de créer une nouvelle commu sur le serveur.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription("🔧 Ajoute une nouvelle commu au serveur.")
            .addStringOption(option => option.setName('nom').setDescription("Le nom de la communauté a ajouter au serveur.").setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription("🔧 Supprime une commu du serveur.")
            .addChannelOption(option => option.setName('categorie').setDescription("La catégorie de la communauté a supprimer du serveur.").addChannelTypes(ChannelType.GuildCategory).setRequired(true))
            .addBooleanOption(option => option.setName('confirmation').setDescription("Confirmer la suppression de la commu.").setRequired(true))),
    async execute(interaction) {
        const name = interaction.options.getString('nom');
        const del_category = interaction.options.getChannel('categorie');
        const confirmation = interaction.options.getBoolean('confirmation');

        switch (interaction.options.getSubcommand()) {
            /**
             * Add a new commu
             */
            case 'add':
                /*
                * Find the position of the new community
                */
                const communities = await Communities.findAll({ order: [['name', 'DESC']] });
                if (communities.length === 0) return interaction.reply({ content: "Avant de créer de nouvelles communautés avec cette commande, vous devez créer manuellement le premier rôle et les premiers salons pour la première communauté. Ensuite, enregistrez-les en utilisant la commande `/admincommu` add. Assurez-vous de **bien placer le rôle de la première communauté dans la liste des rôles** et de **placer la catégorie de la première communauté dans la liste des catégories** du serveur Discord.\n\nUne fois que vous avez créé une autre communauté en utilisant la commande `/commu`, vous pouvez supprimer cette première communauté. Cela garantira que les bonnes permissions et les bons salons sont configurés pour la nouvelle communauté.", ephemeral: true });
                const rolesCommunities = communities.map(community => community.name);
                let positionRole = 0;
                for (let pos = rolesCommunities.length - 1; pos >= -1; pos--) {
                    if (rolesCommunities[pos] >= name) {
                        positionRole = pos + 1;
                        break;
                    }
                }
                const startRolePosition = await interaction.guild.roles.fetch(communities[0].role_id).then(role => { return role.position });

                if (rolesCommunities.includes(name)) return interaction.reply({ content: "Une communauté avec ce nom existe déjà.", ephemeral: true });

                /*
                 * Create the role and the category
                 */
                // Create the role with a random color
                let color = Math.floor(Math.random() * 16777215).toString(16);
                while (color.length < 6) {
                    color = "0" + color;
                }
                const role = await interaction.guild.roles.create({
                    name: name,
                    color: color,
                    position: startRolePosition + positionRole,
                    permissions: [],
                });

                // Create the category
                const startCategoryPosition = await interaction.guild.channels.fetch(communities[communities.length-1].category_id).then(channel => { return channel.position });

                const category = await interaction.guild.channels.create({
                    name: `💻┃Commu ${name}`,
                    type: ChannelType.GuildCategory,
                    position: startCategoryPosition + communities.length-positionRole,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                        }
                    ],
                });

                // Create the channel of the category
                const channel_mission = await category.children.create({
                    name: `missions-${name.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    topic: `Nous vous proposons des missions basées sur ${name}.`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.SendMessagesInThreads, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads, PermissionFlagsBits.AddReactions],
                        },
                        {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        }
                    ],
                });
                await category.children.create({
                    name: `${name.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    topic: `Nous vous proposons d'échange entre membres possédant des compétences en ${name}.`,
                });
                await category.children.create({
                    name: `Vocal ${name}`,
                    type: ChannelType.GuildVoice,
                });

                // Add the commu in the database
                await Communities.create({
                    category_id: category.id,
                    name: name,
                    role_id: role.id,
                    channel_mission_id: channel_mission.id,
                });

                return interaction.reply({ content: `La communauté **${name}** a été ajoutée au serveur.`, ephemeral: true });

            /**
             * Remove a commu
             */
            case 'remove':
                if (!confirmation) return interaction.reply({ content: "Vous devez confirmer la suppression de la communauté.", ephemeral: true });

                const community = await Communities.findOne({ where: { category_id: del_category.id } });
                if (!community) return interaction.reply({ content: "La catégorie n'est pas une communauté technologique.", ephemeral: true });

                const del_role = await interaction.guild.roles.fetch(community.role_id);
                if (!del_role) return interaction.reply({ content: "Le rôle de la communauté n'a pas été trouvé.", ephemeral: true });

                // Delete the role
                const del_name_role = del_role.name;
                await del_role.delete();

                // Delete channel of the category and the category
                await del_category.children.cache.forEach(async channel => {
                    await channel.delete();
                });
                await del_category.delete();

                // Delete the community in the database
                await community.destroy();

                return interaction.reply({ content: `La communauté **${del_name_role}** a été supprimée du serveur.`, ephemeral: true });

            default:
                return interaction.reply({ content: "Une erreur est survenue.", ephemeral: true });
        }
    },
};

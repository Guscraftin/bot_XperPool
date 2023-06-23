const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { category_admin, category_general, category_important, category_xerpool, role_admins, role_members, role_bots } = require('../../const.json');

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
            .addChannelOption(option => option.setName('categorie').setDescription("La catégorie de la communauté a supprimer du serveur.").addChannelTypes(ChannelType.GuildCategory).setRequired(true))),
    async execute(interaction) {
        const name = interaction.options.getString('nom');
        const del_category = interaction.options.getChannel('categorie');

        switch (interaction.options.getSubcommand()) {
            case 'add':
                /*
                * Find the position of the role
                */
                // Get all commu roles and sort them by name in roles array
                const roles_fetch = await interaction.guild.roles.fetch();
                const roles = await roles_fetch.filter(role => !role.managed && role.id != interaction.guild.id && role.id != role_admins && role.id != role_members && role.id != role_bots);
                roles.sort(compareName);

                // Find the position of the role
                const position = findPositionReverse(roles, name);
                const pos_member_role = await interaction.guild.roles.fetch(role_members).then(role => {return role.position});

                /*
                 * Create the role and the category
                 */
                // Create the role with a random color
                const color = Math.floor(Math.random()*16777215).toString(16);
                const role = await interaction.guild.roles.create({
                    name: name,
                    color: color,
                    position: pos_member_role + position,
                    permissions: [],
                });

                // Create the category
                const category_fetch = await interaction.guild.channels.fetch();
                const categories = await category_fetch.filter(channel => channel.type == ChannelType.GuildCategory && channel.id != category_admin && channel.id != category_general && channel.id != category_important && channel.id != category_xerpool);
                categories.sort(compareName);
                
                const position_category = findPosition(categories, name);
                const pos_important_category = await interaction.guild.channels.fetch(category_important).then(channel => {return channel.position});

                const category = await interaction.guild.channels.create({
                    name: `💻┃Commu ${name}`,
                    type: ChannelType.GuildCategory,
                    position: pos_important_category + position_category,
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
                await category.children.create({
                    name: `missions-${name.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    topic: `Ce salon permet de proposer des missions pour les personnes ayant des compétences en ${name}.`,
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
                    topic: `Ce salon permet aux membres ayant des compétences en ${name} d'échanger entre eux.`,
                });
                await category.children.create({
                    name: `Vocal ${name}`,
                    type: ChannelType.GuildVoice,
                });
 
                return interaction.reply({content: `La communauté **${name}** a été ajoutée au serveur.`, ephemeral: true});

            case 'remove':
                // Check if the category is a commulogy category
                if (!del_category.name.startsWith("💻┃Commu")) {
                    return interaction.reply({content: "Cette catégorie n'est pas une catégorie de communauté.", ephemeral: true});
                }

                // Delete the role
                const del_name_role = del_category.name.split(" ")[1].toLowerCase();
                const del_role_fetch = await interaction.guild.roles.fetch();
                const del_role = await del_role_fetch.find(role => role.name.toLowerCase() == del_name_role);
                await del_role.delete();

                // Delete channel of the category and the category
                await del_category.children.cache.forEach(async channel => {
                    await channel.delete();
                });
                await del_category.delete();

                return interaction.reply({content: `La communauté **${del_name_role}** a été supprimée du serveur.`, ephemeral: true});

            default:
                return interaction.reply({content: "Une erreur est survenue.", ephemeral: true});
        }
    },
};

function compareName(a, b) {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    if (aLower < bLower) {
        return -1;
    }
    if (aLower > bLower) {
        return 1;
    }
    return 0;
}

function findPositionReverse(roles, name) {
    const roles_size = roles.size;
    let position = roles_size+1;
    const nameLower = name.toLowerCase();
    for (let pos = roles_size-1; pos >= 0; pos--) {
        if (roles.at(pos).name.toLowerCase() <= nameLower) {
            position = roles_size-pos;
            break;
        }
    }
    return position;
}

function findPosition(channels, name) {
    const channels_size = channels.size;
    let position = channels_size;
    const nameLower = name.toLowerCase();
    for (let pos = 0; pos < channels_size; pos++) {
        if (channels.at(pos).name.split(" ")[1].toLowerCase() >= nameLower) {
            position = pos;
            break;
        }
    }
    return position;
}

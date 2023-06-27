const { SlashCommandBuilder } = require('discord.js');
const { role_admins, role_bots, role_members } = require(process.env.CONST);
const { Members } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adminuser")
        .setDescription("🔧 Commande admin pour gérer les utilisateurs de la base de données.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("🔧 Ajouter un utilisateur à la base de données.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("L'utilisateur a ajouter.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("first_name")
                        .setDescription("Son prénom.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("last_name")
                        .setDescription("Son nom de famille.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("email")
                        .setDescription("Son mail.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("tel")
                        .setDescription("Son numéro de téléphone.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("technologies")
                        .setDescription("Ses domaines de compétences (nom nom nom).")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription("🔧 Mettre à jour un utilisateur dans la base de données.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("L'utilisateur a ajouter.")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("first_name")
                        .setDescription("Son prénom."))
                .addStringOption(option =>
                    option.setName("last_name")
                        .setDescription("Son nom de famille."))
                .addStringOption(option =>
                    option.setName("email")
                        .setDescription("Son mail."))
                .addStringOption(option =>
                    option.setName("tel")
                        .setDescription("Son numéro de téléphone."))
                .addStringOption(option =>
                    option.setName("technologies")
                        .setDescription("Ses domaines de compétences (nom nom nom)."))
        ),
    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const first_name = interaction.options.getString('first_name');
        const last_name = interaction.options.getString('last_name');
        const email = interaction.options.getString('email');
        const tel = interaction.options.getString('tel');
        const technologies = interaction.options.getString('technologies');


        // Exception
        if (user.user.bot) return interaction.reply({ content: "Vous ne pouvez pas ajouter un bot à la base de données.", ephemeral: true });

        
        // Normalize the user's name
        const first_name_nor = first_name ? first_name.charAt(0).toUpperCase() + first_name.slice(1).toLowerCase() : null;
        const last_name_nor = last_name ? last_name.toUpperCase() : null;


        // Check if user exists in db
        const userExists = await Members.findOne({ where: { member_id: user.id } });
        if (!userExists && interaction.options.getSubcommand() === 'edit') {
            return interaction.reply({ content: `${user} n'existe pas dans la base de données.\nVeuillez l'ajouter avec la commande \`/adminuser add\`.`, ephemeral: true });
        } else if (userExists && interaction.options.getSubcommand() === 'add') {
            return interaction.reply({ content: `${user} existe déjà dans la base de données.\nVeuillez le modifier avec la commande \`/adminuser edit\`.`, ephemeral: true });
        }
        
        
        // Check the technologies
        const technologiesArray = technologies ? technologies.split(' ') : [];
        const technologiesArrayFiltered = technologiesArray.filter(technology => technology !== '');
        const guildRoles = await interaction.guild.roles.fetch();

        let technoRoles = [];
        for (const technology of technologiesArrayFiltered) {
            const role = await guildRoles.find(role => role.name.toLowerCase() === technology.toLowerCase());
            if (!role) {
                return interaction.reply({ content: `Le rôle ${technology} n'existe pas sur le serveur.`, ephemeral: true });
            } else {
                technoRoles.push(role);
            }
        }
        
        
        // Update the database
        if (!userExists) {
            try {
                await Members.upsert({ member_id: user.id, first_name: first_name_nor, last_name: last_name_nor, email: email, tel: tel, technologies: technologies });
            } catch (error) {
                console.error("adminuser.js add - " + error);
                return interaction.reply({ content: `Une erreur est survenue lors de l'ajout de l'utilisateur ${user} à la base de données.`, ephemeral: true });
            }
        } else {
            try {
                if (first_name) await Members.update({ first_name: first_name_nor }, { where: { member_id: user.id } });
                if (last_name) await Members.update({ last_name: last_name_nor }, { where: { member_id: user.id } });
                if (email) await Members.update({ email: email }, { where: { member_id: user.id } });
                if (tel) await Members.update({ tel: tel }, { where: { member_id: user.id } });
                if (technologies) await Members.update({ technologies: technologies }, { where: { member_id: user.id } });
            } catch (error) {
                console.error("adminuser.js update - " + error);
                return interaction.reply({ content: `Une erreur est survenue lors de la mise à jour de l'utilisateur ${user} dans la base de données.`, ephemeral: true });
            }
        }


        // Update the user's roles
        if (!userExists) {
            const memberRole = await interaction.guild.roles.fetch(role_members);
            
            if (technoRoles.length > 0) {
                await user.roles.add(technoRoles);
            }
            await user.roles.add(memberRole);

            // Change nickname
            const nickname = `${first_name_nor}_${last_name}`;
            await user.setNickname(nickname);

            return interaction.reply({ content: `${user} a été ajouté à la base de données.`, ephemeral: true });

        } else {        
            const userRolesArray = user.roles.cache.map(role => role);
            const userRolesArrayFiltered = userRolesArray.filter(role => role.id !== role_members && role.id !== role_admins && role.id !== role_bots && !role.managed);
            const userRolesToRemove = userRolesArrayFiltered.filter(role => !technoRoles.includes(role));
            const userRolesToAdd = technoRoles.filter(role => !userRolesArrayFiltered.includes(role));

            if (userRolesToRemove.length > 0) {
                await user.roles.remove(userRolesToRemove);
            }
            if (userRolesToAdd.length > 0) {
                await user.roles.add(userRolesToAdd);
            }

            // Change nickname
            const userDB = await Members.findOne({ where: { member_id: user.id } });
            if (user.nickname !== `${userDB.first_name}_${userDB.last_name}`) {
                if (first_name_nor && last_name_nor) await user.setNickname(`${first_name_nor}_${last_name_nor}`);
                else if (first_name_nor) await user.setNickname(`${first_name_nor}_${userDB.last_name}`);
                else if (last_name_nor) await user.setNickname(`${userDB.first_name}_${last_name_nor}`);
                else await user.setNickname(`${userDB.first_name}_${userDB.last_name}`);
            }

            return interaction.reply({ content: `${user} a bien été mis à jour dans la base de données.`, ephemeral: true });
        }
    },
};

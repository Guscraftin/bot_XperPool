const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { channel_all_missions, channel_detail_missions, channel_staff_missions, color_accept, color_decline } = require(process.env.CONST);
const { LogMissions, Missions } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mission")
        .setDescription("🔧 Permet d'envoyer une nouvelle mission.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("🔧 Permet d'envoyer une nouvelle mission.")
            .addStringOption(option => option.setName('titre').setDescription("Titre de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('client').setDescription("Client de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('seniorite').setDescription("Seniorité de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('tjm').setDescription("TJM de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('debut').setDescription("Date de début de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('lieu').setDescription("Lieu de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('frequence').setDescription("Fréquence de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('teletravail').setDescription("Télétravail de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('duree').setDescription("Durée de la mission.").setMaxLength(1024).setRequired(true))
            .addStringOption(option => option.setName('competences').setDescription("Compétences de la mission.").setMaxLength(1024).setRequired(true))
            .addChannelOption(option => option.setName("salon").setDescription("Le salon staff de la mission.").addChannelTypes(ChannelType.PublicThread).setRequired(true))
            .addChannelOption(option => option.setName('commu').setDescription("La commu a qui la mission s'adresse.").addChannelTypes(ChannelType.GuildCategory)))
        .addSubcommand(subcommand => subcommand
            .setName("edit")
            .setDescription("🔧 Permet de mettre à jour une mission.")
            .addIntegerOption(option => option
                .setName('id')
                .setDescription("L'id de la mission.")
                .setMinValue(1)
                .setRequired(true))
            .addStringOption(option => option
                .setName('status')
                .setDescription("Le status de la mission.")
                .addChoices(
                    { name: 'Ouvert', value: 'open' },
                    { name: 'Fermé', value: 'close' },
                )
                .setRequired(true)
            ))
        .addSubcommand(subcommand => subcommand
            .setName("delete")
            .setDescription("🔧 Permet de supprimer une mission.")
            .addIntegerOption(option => option
                .setName('id')
                .setDescription("L'id de la mission.")
                .setMinValue(1)
                .setRequired(true))
            .addBooleanOption(option => option
                .setName('confirm')
                .setDescription("Confirmer la suppression de la mission.")
                .setRequired(true))),
    async execute(interaction) {

        switch (interaction.options.getSubcommand()) {
            case "add":
                const title = interaction.options.getString('titre');
                const client = interaction.options.getString('client');
                const seniority = interaction.options.getString('seniorite');
                const tjm = interaction.options.getString('tjm');
                const start = interaction.options.getString('debut');
                const place = interaction.options.getString('lieu');
                const frequency = interaction.options.getString('frequence');
                const teleworking = interaction.options.getString('teletravail');
                const duration = interaction.options.getString('duree');
                const skills = interaction.options.getString('competences');
                const channelStaff = interaction.options.getChannel('salon');
                const community = interaction.options.getChannel('commu');

                // Check the channelStaff
                if (channelStaff.parentId !== channel_staff_missions) return interaction.reply({ content: `Le salon staff de la mission doit être un fil de discussion public dans le salon <#${channel_staff_missions}>.`, ephemeral: true });

                const channelStaffUsed = await Missions.findOne({ where: { channel_staff_id: channelStaff.id } });
                if (channelStaffUsed) return interaction.reply({ content: `Le salon staff de la mission est déjà utilisé par la mission ${channelStaffUsed.id}.`, ephemeral: true });

                const maxCharacter = 2000;
                const messageDetail = await channelStaff.messages.fetch().then(messages => {return messages.last()});
                if (messageDetail.content.length > maxCharacter) return interaction.reply({ content: `${messageDetail.url} doit contenir **moins de ${maxCharacter+1}**. Actuellement, il en a ${messageDetail.content.length}.`, ephemeral: true });

                // Get the mission channel of the community category
                const channel = await interaction.guild.channels.fetch().then(channels => {
                    if (community) return channels.filter(channel => channel.type === ChannelType.GuildText && channel.parentId === community.id && channel.name.includes("missions-"))
                });

                // Create the embed mission
                const missionEmbed = new EmbedBuilder()
                    .setTitle("Nouvelle mission disponible !")
                    .setFields([
                        { name: "📋 Mission", value: title, inline: true },
                        { name: "💼 Client", value: client, inline: true },
                        { name: "🧠 Seniorité", value: seniority, inline: true },
                        { name: "💰 TJM", value: tjm, inline: true },
                        { name: "📆 Date de début", value: start, inline: true },
                        { name: "🌍 Lieu", value: place, inline: true },
                        { name: "🕗 Fréquence", value: frequency, inline: true },
                        { name: "💻 Télétravail", value: teleworking, inline: true },
                        { name: "⌛ Durée", value: duration, inline: true },
                        { name: "🔧 Compétences", value: skills, inline: true },
                    ])
                    .setColor(color_accept)
                    .setTimestamp()
                    .setFooter({ text: `Id: X`, iconURL: interaction.guild.iconURL() });

                // Create the button row
                const buttonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("mission_send")
                            .setStyle(ButtonStyle.Success)
                            .setLabel("Publier la mission")
                    );

                // Send the embed mission
                return interaction.reply({ content: 
                    `**Es-tu sur de vouloir publier cette mission dans <#${channel_all_missions}>${channel ? ` et dans ${channel.first()}` : ``} ?**\nAvec le salon staff : ${channelStaff}`,
                    embeds: [missionEmbed],
                    components: [buttonRow],
                    ephemeral: true
                });

            case "edit":
                const id = interaction.options.getInteger('id');
                const status = interaction.options.getString('status');

                const channelDetails = await interaction.guild.channels.fetch(channel_detail_missions);
                if (!channelDetails) return interaction.reply({ content: "Le salon de détails de la mission n'existe plus mais le changement a bien eu lieu.", ephemeral: true });

                // Get the mission
                const mission = await Missions.findOne({ where: { id: id } });
                if (!mission) return interaction.reply({ content: "Cette mission n'existe pas.\nVérifier l'id entrée.", ephemeral: true });

                let is_open;
                if (mission.is_open) {
                    if (status === "open") return interaction.reply({ content: "Cette mission est déjà ouverte.", ephemeral: true });
                    is_open = false;
                } else {
                    if (status === "close") return interaction.reply({ content: "Cette mission est déjà fermée.", ephemeral: true });
                    is_open = true;
                }

                // Get the embed
                const main_channel = await interaction.guild.channels.fetch(channel_all_missions);
                if (!main_channel) return interaction.reply({ content: "Le salon de la mission n'existe plus.", ephemeral: true });
                const message = await main_channel.messages.fetch(mission.main_msg_id);
                if (!message) return interaction.reply({ content: "Le message de la mission n'existe plus.", ephemeral: true });
                const embed = message.embeds[0];

                // Edit the embed
                const newEmbed = new EmbedBuilder()
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .setColor(is_open ? color_accept : color_decline)
                    .setFields(embed.fields)
                    .setTimestamp()
                    .setFooter(embed.footer);

                // Update the database
                Missions.update({ is_open }, { where: { id: mission.id } });

                // Edit the message
                if (mission.particular_msg_id) {
                    await interaction.guild.channels.fetch(channel_all_missions).then(channel => {
                        channel.messages.fetch(mission.main_msg_id).then(msg => msg.edit({ embeds: [newEmbed] }));
                    });
                    const channels_fetch = await interaction.guild.channels.fetch();
                    const channel = channels_fetch.filter(channel => channel.type === ChannelType.GuildText && channel.name.includes("missions-"));
                    await channel.each(channel => {
                        channel.messages.fetch(mission.particular_msg_id).then(msg => msg.edit({ embeds: [newEmbed] })).catch(error => {return});
                    });
                } else {
                    await message.edit({ embeds: [newEmbed] });
                }


                // Send message in details channel for members where interested
                await channelDetails.threads.fetch().then(threads => {
                    threads.threads.each(async thread => {
                        if (thread.parentId === channel_detail_missions && thread.name.split(" ")[1] == mission.id) {
                            const isButtEnabled = await thread.messages.fetch().then(messages => {
                                return !messages.at(-3).components[0].components[0].disabled;
                            });
                            if (isButtEnabled) {
                                const member = await thread.members.fetch().then(members => {
                                    return members.filter(member => !member.bot).first();
                                });
                                if (member) await thread.send({ content: `<@${member.id}>, cette mission a été ${is_open ? "réouverte" : "fermée"}.` });
                                else await thread.send({ content: `Cette mission a été ${is_open ? "réouverte" : "fermée"}.` });

                                // Delete the thread after 48h if the mission is closed
                                if (!is_open) {
                                    setTimeout(async () => {
                                        const mission = await Missions.findOne({ where: { id: id } });
                                        if (mission && mission.is_open) return console.log("Mission is open");
                                        const logMission = await LogMissions.findOne({ where: { channel_details: thread.id } });
                                        if (logMission) {console.log("is_delete"); await logMission.update({ is_delete: true });}
                                        await thread.delete();
                                    } , 172800000); // 48h = 172800000 milliseconds
                                }
                            }
                        }
                    });
                });


                // Send log in the staff channel
                const channelStaffLog = await interaction.guild.channels.fetch(mission.channel_staff_id);
                if (!channelStaffLog) return interaction.reply({ content: "Le salon staff de la mission n'existe plus mais le changement a bien eu lieu.", ephemeral: true });
                
                await channelStaffLog.send({ content: `La mission (${message.url}) a été ${is_open ? "réouverte" : "fermée"} par ${interaction.member}.` });

                return interaction.reply({ content: `La mission (${message.url}) a bien été ${is_open ? "réouverte" : "fermée"}.`, ephemeral: true });

            case "delete":
                const id_delete = interaction.options.getInteger('id');
                const confirm = interaction.options.getBoolean('confirm');

                if (!confirm) return interaction.reply({ content: "Vous devez confirmer la suppression de la mission.", ephemeral: true });

                // Get the mission
                const mission_delete = await Missions.findOne({ where: { id: id_delete } });
                if (!mission_delete) return interaction.reply({ content: "Cette mission n'existe pas.\nVérifier l'id entrée.", ephemeral: true });

                // Get the embed message and delete it
                const main_channel_delete = await interaction.guild.channels.fetch(channel_all_missions);
                if (!main_channel_delete) return interaction.reply({ content: "Le salon de la mission n'existe plus.", ephemeral: true });
                const message_delete = await main_channel_delete.messages.fetch(mission_delete.main_msg_id);
                if (!message_delete) return interaction.reply({ content: "Le message de la mission n'existe plus.", ephemeral: true });
                await message_delete.delete();

                if (mission_delete.particular_msg_id) {
                    const particular_channel_delete = await interaction.guild.channels.fetch(mission_delete.channel_particular_id);
                    if (!particular_channel_delete) return interaction.reply({ content: "Particular: Le salon de la mission n'existe plus.", ephemeral: true });
                    const message_particular_delete = await particular_channel_delete.messages.fetch(mission_delete.particular_msg_id);
                    if (!message_particular_delete) return interaction.reply({ content: "Particular: Le message de la mission n'existe plus.", ephemeral: true });
                    await message_particular_delete.delete();
                }


                // Send message in thread and delete mission in db
                let logMissionMember;
                try {
                    logMissionMember = await LogMissions.findAll({ where: { mission_id: mission_delete.id } });
                }
                catch (error) {
                    console.error("mission.js LogMissionsDB - " + error);
                }

                if (logMissionMember) {
                    for (const logMission of logMissionMember) {
                        const thread = await interaction.guild.channels.fetch(logMission.channel_details);
                        if (thread) {
                            const member = await thread.members.fetch().then(members => {
                                return members.filter(member => !member.bot).first();
                            });
                            if (member) await thread.send({ content: `<@${member.id}>, cette mission a été supprimé. Ce fil de discussion sera supprimé dans 48h.` });
                            else await thread.send({ content: `Cette mission a été supprimé. Ce fil de discussion sera supprimé dans 48h.` });
                        }

                        try {
                            await logMission.destroy();
                        } catch (error) {
                            console.error("mission.js ThreadDB - " + error);
                        }
                    }
                }

                const channel_staff_delete = await interaction.guild.channels.fetch(mission_delete.channel_staff_id);
                if (channel_staff_delete) await channel_staff_delete.delete();
                await mission_delete.destroy();

                // Delete thread in details channel after 48h
                setTimeout(async () => {
                    for (const logMission of logMissionMember) {
                        const thread = await interaction.guild.channels.fetch(logMission.channel_details);
                        if (thread) await thread.delete();
                    }
                } , 172800000); // 48h = 172800000 milliseconds


                return interaction.reply({ content: `La mission a bien été supprimée.`, ephemeral: true });
        }

    },
};
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { channel_all_missions, channel_staff_missions, _color_green, _color_red, color_accept, color_decline } = require('../../const.json');
const { Missions } = require('../../dbObjects');

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
            .addStringOption(option => option
                .setName('id')
                .setDescription("L'id de la mission.")
                .setRequired(true))
            .addStringOption(option => option
                .setName('status')
                .setDescription("Le status de la mission.")
                .addChoices(
                    { name: 'Ouvert', value: 'open' },
                    { name: 'Fermé', value: 'close' },
                )
                .setRequired(true)
            )),
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
                const id = interaction.options.getString('id');
                const status = interaction.options.getString('status');

                // Get the message
                const message = await interaction.channel.messages.fetch(id).catch(error => {return});
                if (!message) return interaction.reply({ content: "Le message n'a pas été trouvé.", ephemeral: true });
                const embed = message.embeds[0];
                const color = embed.color;

                // Exception
                if (!interaction.channel.name.includes("missions")) return interaction.reply({ content: "Cette commande ne peut être utilisée que dans un channel de mission.", ephemeral: true });
                if (color == _color_green && status === "open") return interaction.reply({ content: "Cette mission est déjà ouverte.", ephemeral: true });
                if (color == _color_red && status === "close") return interaction.reply({ content: "Cette mission est déjà fermée.", ephemeral: true });

                // Get the main message
                let main_message_id = id;
                let mission;
                if (interaction.channel.id !== channel_all_missions) {
                    try {
                        mission = await Missions.findOne({ where: { particular_msg_id: id } });
                        if (!mission) return interaction.reply({ content: "Aucune mission n'a été trouvée avec cet id.", ephemeral: true });
                        main_message_id = mission.main_msg_id;
                    } catch (error) {
                        console.error(error);
                        return interaction.reply({ content: "Une erreur est survenue lors de la récupération de la base de donnée.", ephemeral: true });
                    }
                } else {
                    try {
                        mission = await Missions.findOne({ where: { main_msg_id: id } });
                        if (!mission) return interaction.reply({ content: "Aucune mission n'a été trouvée avec cet id.", ephemeral: true });
                    } catch (error) {
                        console.error(error);
                        return interaction.reply({ content: "Une erreur est survenue lors de la récupération de la base de donnée.", ephemeral: true });
                    }
                }
                
                // Update the database
                const is_open = status === "open" ? true : false;
                Missions.update({ is_open }, { where: { main_msg_id: main_message_id } });

                // Edit the embed
                const newEmbed = new EmbedBuilder()
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .setColor(is_open ? color_accept : color_decline)
                    .setFields(embed.fields)
                    .setTimestamp()
                    .setFooter(embed.footer);

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

                return interaction.reply({ content: `La mission (${message.url}) a bien été ${is_open ? "ouverte" : "fermée"}.`, ephemeral: true });
            }

    },
};
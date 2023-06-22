const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { channel_all_missions } = require('../../const.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("newmission")
        .setDescription("🔧 Permet d'envoyer une nouvelle mission.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
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
        .addChannelOption(option => option.setName('commu').setDescription("La commu a qui la mission s'adresse.").addChannelTypes(ChannelType.GuildCategory)),
    async execute(interaction) {
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
        const community = interaction.options.getChannel('commu');

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
            .setColor("#0099ff")
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL()});

        // Create the button row
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("mission_send")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Publier la mission")
            );

        // Send the embed mission
        return interaction.reply({ content: `Es-tu sur de vouloir publier cette mission dans <#${channel_all_missions}>${channel ? ` et dans ${channel.first()}` : ``} ?`, embeds: [missionEmbed], components: [buttonRow], ephemeral: true });
    },
};
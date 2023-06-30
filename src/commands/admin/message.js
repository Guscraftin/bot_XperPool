const { ChannelType, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("message")
        .setDescription("🔧 Permet d'envoyer un message via le bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName("copier")
            .setDescription("Permet de copier un message dans un autre salon.")
            .addStringOption(option => option.setName("id").setDescription("L'id du message à déplacer.").setRequired(true))
            .addChannelOption(option => option.setName("salon").setDescription("Le salon où déplacer le message.").setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildAnnouncement))),
    async execute(interaction) {
        const id = interaction.options.getString("id");
        const channel = interaction.options.getChannel("salon");

        switch (interaction.options.getSubcommand()) {
            case "copier":
                const msg = await interaction.channel.messages.fetch(id).catch(() => { return null; });
                if (!msg || msg.size > 1) return interaction.reply({ content: "Le message à copier n'existe pas.", ephemeral: true });

                const newMsg = await channel.send({ content: msg.content, embeds: msg.embeds });
                return interaction.reply({ content: `Message correctement copié : ${newMsg.url} !`, ephemeral: true });

            default:
                return interaction.reply({ content: "Cette sous-commande n'existe pas.", ephemeral: true });
        }
    }
}
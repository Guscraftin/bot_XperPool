const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("🔧 Permet d'envoyer un embed via le bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option => option.setName("contenu").setDescription("Le contenu a envoyé dans le message (ce qui est hors embed)."))
        .addStringOption(option => option.setName("titre").setDescription("Le titre de l'embed."))
        .addStringOption(option => option.setName("url").setDescription("L'url accessible en cliquant sur le titre de l'embed."))
        .addStringOption(option => option.setName("description").setDescription("La description de l'embed."))
        .addAttachmentOption(option => option.setName("vignette").setDescription("La \"miniatur`\" de l'embed."))
        .addStringOption(option => option.setName("couleur").setDescription("La couleur de l'embed (format html comme : #77Ab00).").setMinLength(6).setMaxLength(7))
        .addAttachmentOption(option => option.setName("image").setDescription("L'image de l'embed.")),
    async execute(interaction) {
        const content = interaction.options.getString("contenu");
        const titre = interaction.options.getString("titre");
        const url = interaction.options.getString("url");
        const description = interaction.options.getString("description");
        const vignette = interaction.options.getAttachment("vignette");
        const color = interaction.options.getString("couleur");
        const image = interaction.options.getAttachment("image");

        // Exception if some required options are missing
        if (url && !titre) return interaction.reply({ content: "Vous devez spécifier un titre si vous spécifiez une url.", ephemeral: true });
        let vignetteUrl, imageUrl;
        if (vignette) vignetteUrl = vignette.url;
        if (image) imageUrl = image.url;
        if (color && !titre && !description && !vignetteUrl && !imageUrl) return interaction.reply({ content: "Vous devez spécifier au moins un titre, une description, une vignette ou une image si vous spécifiez une couleur.", ephemeral: true });
        if (color) {
            const pattern = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))$/;
            if (!pattern.test(color)) return interaction.reply({ content: "La couleur doit être au format html (comme : #77Ab00).", ephemeral: true });
        }

        // Send the message
        const embed = new EmbedBuilder()
            .setTitle(titre)
            .setURL(url)
            .setDescription(description)
            .setThumbnail(vignetteUrl)
            .setColor(color)
            .setImage(imageUrl);

        if (content) await interaction.channel.send(content, { embeds: [embed] });
        else await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
    },
};

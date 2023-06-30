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
        .addAttachmentOption(option => option.setName("image").setDescription("L'image de l'embed."))
        .addStringOption(option => option.setName("id").setDescription("L'id du message a modifier dans ce salon.")),
    async execute(interaction) {
        const content = interaction.options.getString("contenu");
        const titre = interaction.options.getString("titre");
        const url = interaction.options.getString("url");
        const description = interaction.options.getString("description");
        const vignette = interaction.options.getAttachment("vignette");
        const color = interaction.options.getString("couleur");
        const image = interaction.options.getAttachment("image");
        const id = interaction.options.getString("id");

        // Exception if some required options are missing
        if (url && !titre) return interaction.reply({ content: "Vous devez spécifier un titre si vous spécifiez une url.", ephemeral: true });
        let vignetteUrl, imageUrl, msg;
        if (vignette) vignetteUrl = vignette.url;
        if (image) imageUrl = image.url;
        if (color && !titre && !description && !vignetteUrl && !imageUrl) return interaction.reply({ content: "Vous devez spécifier au moins un titre, une description, une vignette ou une image si vous spécifiez une couleur.", ephemeral: true });
        if (color) {
            const pattern = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))$/;
            if (!pattern.test(color)) return interaction.reply({ content: "La couleur doit être au format html (comme : #77Ab00).", ephemeral: true });
        }
        if (id) {
            msg = await interaction.channel.messages.fetch(id).catch(() => { return null; });
            if (!msg || msg.size > 1) return interaction.reply({ content: "Le message à modifier n'existe pas.", ephemeral: true });
            if (!msg.author.bot) return interaction.reply({ content: "Le message à modifier n'a pas été envoyé par le bot.", ephemeral: true });
            if (!content && !titre && !description && !vignetteUrl && !imageUrl) return interaction.reply({ content: "Vous devez spécifier au moins un contenu, un titre, une description, une vignette ou une image.\nSi vous souhaitez supprimer le message, supprimez le manuellement.", ephemeral: true });
        }

        // Send the message
        const embed = new EmbedBuilder()
            .setTitle(titre)
            .setURL(url)
            .setDescription(description)
            .setThumbnail(vignetteUrl)
            .setColor(color)
            .setImage(imageUrl);

        if (id) {
            if (!titre && !description && !vignetteUrl && !imageUrl) await msg.edit({ content: content, embeds: [] });
            else await msg.edit({ content: content, embeds: [embed] });
            await interaction.reply({ content: `Message correctement modifié : ${msg.url} !`, ephemeral: true });
        } else {
            if (content && !titre && !description && !vignetteUrl && !imageUrl) await interaction.channel.send({ content: content });
            else if (content) await interaction.channel.send({ content: content, embeds: [embed] });
            else await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
        }
    },
};

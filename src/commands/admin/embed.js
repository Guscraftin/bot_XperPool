const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("🔧 Permet d'envoyer un embed via le bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option => option.setName("titre").setDescription("Le titre de l'embed.").setMaxLength(256))
        .addStringOption(option => option.setName("url").setDescription("L'url accessible en cliquant sur le titre de l'embed."))
        .addStringOption(option => option.setName("description").setDescription("La description OU l'id du message pour la description de l'embed.").setMaxLength(4096))
        .addAttachmentOption(option => option.setName("vignette").setDescription("La \"miniatur`\" de l'embed."))
        .addStringOption(option => option.setName("couleur").setDescription("La couleur de l'embed (format html comme : #77Ab00).").setMinLength(6).setMaxLength(7))
        .addAttachmentOption(option => option.setName("image").setDescription("L'image de l'embed."))
        .addStringOption(option => option.setName("id").setDescription("L'id du message a modifier dans ce salon.")),
    async execute(interaction) {
        const titre = interaction.options.getString("titre");
        const url = interaction.options.getString("url");
        let description = interaction.options.getString("description");
        const vignette = interaction.options.getAttachment("vignette");
        const color = interaction.options.getString("couleur");
        const image = interaction.options.getAttachment("image");
        const id = interaction.options.getString("id");

        // Check content and description
        const onlyNumber = /^\d+$/;
        if (description && onlyNumber.test(description)) {
            const descriptionCheck = await interaction.channel.messages.fetch(description).catch(() => { return null; });
            if (!descriptionCheck || descriptionCheck.size > 1) return interaction.reply({ content: "La description du message à copier n'existe pas.", ephemeral: true });
            if (descriptionCheck.content && descriptionCheck.content.length > 4096) return interaction.reply({ content: "La description ne peut pas dépasser 2000 caractères.", ephemeral: true });
            if (descriptionCheck.content === '') return interaction.reply({ content: "La description du message ne doit pas être vide. Si vous ne voulez pas de description, ne rentrez pas ce champ lors de l'exécution de la commande.", ephemeral: true });
            description = descriptionCheck.content;
        }


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
            if (!titre && !description && !vignetteUrl && !imageUrl) return interaction.reply({ content: "Vous devez spécifier au moins un titre, une description, une vignette ou une image.\nSi vous souhaitez supprimer le message, supprimez le manuellement.", ephemeral: true });
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
            if (!titre && !description && !vignetteUrl && !imageUrl) await msg.edit({ embeds: [] });
            else await msg.edit({ embeds: [embed] });
            await interaction.reply({ content: `Message correctement modifié : ${msg.url} !`, ephemeral: true });
        } else {
            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
        }
    },
};

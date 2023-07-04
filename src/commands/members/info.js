const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { color_basic } = require(process.env.CONST);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Afficher les informations du bot.")
        .setDMPermission(true),
    async execute(interaction) {
        const botUser = interaction.client.user;
        let isTeamOwner = false;
        let owner = "Aucun";
        await interaction.client.application.fetch().then(function(bot) {
            if (bot.owner.username !== undefined) {
                owner = `▸ [${bot.owner.username}](https://discord.com/users/${bot.owner.id})`
            } else {
                isTeamOwner = true;
                owner = "";
                bot.owner.members.forEach(member => {
                    owner += `▸ [${bot.owner.username}](https://discord.com/users/${bot.owner.id})\n`;
                });
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('Information sur le bot :')
            .setAuthor({ name: botUser.username, iconURL: botUser.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setURL('https://www.xperpool.fr/')
            .setDescription("J'ai été créé dans le but de vous aider dans votre expérience sur ce serveur discord.")
            .addFields(
                { name: 'Date de création', value: `<t:${parseInt(botUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'En ligne depuis', value: `<t:${parseInt(interaction.client.readyTimestamp / 1000)}:f>`, inline: true },
                { name: `${isTeamOwner ? "Mes propriétaires" : "Mon propriétaire"} :`, value: owner, inline: true },
                { name: 'Mes développeurs :', value: `▸ [Guscraftin](https://github.com/Guscraftin)`, inline: true },
            )
            .setColor(color_basic)
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ content: null, embeds: [embed], ephemeral: true });
    },
};

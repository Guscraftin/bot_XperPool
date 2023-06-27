const { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Members } = require('../../dbObjects');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Profil')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        // Get the information about the member
        const member = await Members.findOne({ where: { member_id: interaction.targetId } });
        if (!member) return interaction.reply({ content: "Ce membre n'est pas dans la base de données.", ephemeral: true });

        const memberDiscord = await interaction.guild.members.fetch(interaction.targetId);

        // Create the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${memberDiscord.displayName} (${memberDiscord.id})`, iconURL: memberDiscord.user.displayAvatarURL() })
            .setColor('#009ECA')
            .setDescription(`Voici les informations de ce membre :`)
            .setFields([
                { name: 'Prénom', value: member.first_name, inline: true },
                { name: 'Nom', value: member.last_name, inline: true },
                { name: 'Email', value: member.email, inline: true },
                { name: 'Téléphone', value: member.tel, inline: true },
                { name: 'Technologies', value: member.technologies, inline: true },
                { name: 'Score', value: `${member.score}`, inline: true },
            ])
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

        return interaction.reply({ embeds: [embed], ephemeral: true})
    }
}
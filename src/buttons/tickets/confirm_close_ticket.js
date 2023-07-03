const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Tickets } = require('../../dbObjects');

module.exports = {
    data: {
        name: "confirm_close_ticket",
    },
    async execute(interaction) {
        // Remove user from the ticket
        const ticket = await Tickets.findOne({ where: { channel_id: interaction.channel.id } });
        if (!ticket) return interaction.reply({ content: "Ce ticket n'existe plus. Veuillez contacter un admin.", ephemeral: true });

        const member = await interaction.guild.members.fetch(ticket.user_id).catch(() => {});
        if (!member) return interaction.reply({ content: "Ce ticket n'existe plus. Veuillez contacter un admin.", ephemeral: true });

        await interaction.channel.permissionOverwrites.edit(member, { ViewChannel: false });

        // Create the action row
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("reopen_ticket")
                    .setLabel("Réouvrir le ticket")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("🔓")
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("delete_ticket")
                    .setLabel("Supprimer le ticket")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("🗑️")
            )

        // Send the message
        await interaction.channel.send({
            content: `> ${interaction.member} a fermé ce ticket.`,
        });

        await interaction.channel.send({
            content: "## Que voulez-vous faire ?",
            components: [actionRow],
        });

        return interaction.message.delete();
    }
}
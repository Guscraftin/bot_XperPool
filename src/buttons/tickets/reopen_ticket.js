const { Tickets } = require("../../dbObjects");

/**
 * Come from src/buttons/tickets/confirm_close_ticket.js
 */

module.exports = {
    data: {
        name: "reopen_ticket",
    },
    async execute(interaction) {
        // Add user from the ticket
        const ticket = await Tickets.findOne({ where: { channel_id: interaction.channel.id } });
        if (!ticket) return interaction.reply({ content: "Ce ticket n'existe plus. Veuillez contacter un admin.", ephemeral: true });

        const member = await interaction.guild.members.fetch(ticket.user_id).catch(() => {});
        if (!member) return interaction.reply({ content: "Ce ticket n'existe plus. Veuillez contacter un admin.", ephemeral: true });

        await interaction.channel.permissionOverwrites.edit(member, { ViewChannel: true });

        // Send the message
        await interaction.channel.send({
            content: `> ${interaction.member} a réouvert ce ticket.`,
        });

        const msg = await interaction.channel.send(`<@${member.id}>`);
        await msg.delete();

        return interaction.message.delete();
    }
}
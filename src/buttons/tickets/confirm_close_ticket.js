const discordTranscripts = require('discord-html-transcripts');
const { channel_logs_tickets } = require(process.env.CONST);
const { Tickets } = require('../../dbObjects');

module.exports = {
    data: {
        name: "confirm_close_ticket",
    },
    async execute(interaction) {
        const channel = interaction.channel;
        const ticket = await Tickets.findOne({ where: { channel_id: channel.id } });
        if (!ticket) return interaction.reply({ content: "Ce ticket n'existe plus. Veuillez contacter un admin.", ephemeral: true });
        const member = await interaction.guild.members.fetch(ticket.user_id).catch(() => {});

        // Get the transcript of the messages in channel
        const attachment = await discordTranscripts.createTranscript(channel);

        try {
            await ticket.update({
                channel_id: null,
            });
        } catch (error) {
            console.error("confirm_close_ticket.js tickets channel - " + error);
        }

        // Delete the channel
        await channel.delete();
        
        // Send a message with the transcript to the staff channel
        const channelLogs = await interaction.guild.channels.fetch(channel_logs_tickets);
        if (!channelLogs) return;
        
        const msg = await channelLogs.send({
            content: `**Le ticket de ${member ? member : `\`${channel.name}\``} a été fermé par ${interaction.user}.**\n**Catégorie :** \`${ticket.category}\`\n**Date d'ouverture du ticket :** <t:${parseInt(ticket.createdAt / 1000)}:F> (<t:${parseInt(ticket.createdAt / 1000)}:R>)\n**Date de fermeture du ticket :** <t:${parseInt(Date.now() / 1000)}:F> (<t:${parseInt(Date.now() / 1000)}:R>)`,
            files: [attachment]
        });

        try {
            await ticket.update({
                message_id: msg.id,
            });
        } catch (error) {
            console.error("confirm_close_ticket.js tickets msg - " + error);
        }
    }
}
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { category_tickets, category_tickets_members, color_basic, role_admins } = require(process.env.CONST);
const { Tickets } = require("../../dbObjects");

module.exports = {
    data: {
        name: "open_ticket_reason",
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.values[0];
        const member = interaction.member;

        // Check if the user has already a ticket
        const ticket = await Tickets.findOne({ where: { user_id: interaction.user.id, message_id: null } });
        if (ticket) {
            return interaction.editReply({ content: `Vous avez déjà un ticket ouvert : <#${ticket.channel_id}>`, ephemeral: true });
        }

        // Check if the user is a member
        let isMember = false;
        if (member.roles.cache.size !== 1) {
            isMember = true;
        }

        // Create the channel of the ticket
        const ticketChannel = await interaction.guild.channels.create({
            name: `${interaction.member.displayName}`,
            type: 0,
            parent: isMember ? category_tickets_members : category_tickets,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [ PermissionFlagsBits.ViewChannel ],
                    allow: [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.UseApplicationCommands,
                    ],
                },
                {
                    id: interaction.user.id,
                    allow: [ PermissionFlagsBits.ViewChannel ],
                },
            ],
        });

        // Add the tickets to the database
        const user_name = interaction.member.displayName.split("_");
        try {
            await Tickets.create({
                category: reason,
                user_id: interaction.user.id,
                first_name: isMember ? user_name[0]: interaction.member.displayName,
                last_name: isMember ? user_name[1] : null,
                channel_id: ticketChannel.id,
            });
        } catch (error) {
            console.log("panel_ticket.js tickets - " + error);
        }

        // Create the embed in the ticket channel
        const embed = new EmbedBuilder()
            .setDescription("Merci pour votre ticket, l'équipe XperPool va très vite vous répondre !\n"+
            "Si vous souhaitez fermer ce ticket, veuillez cliquer sur 🔒")
            .setColor(color_basic)
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Fermer le ticket")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🔒")
            );

        const ticketMsg = await ticketChannel.send({ content: `Bonjour ${member} !`, embeds: [embed], components: [row] });
        await ticketMsg.pin();

        // Send a ghost mention to the admins
        await ticketChannel.send(`<@&${role_admins}>`);
        await ticketChannel.messages.fetch().then(messages => {
            messages.at(0).delete();
        });

        await interaction.editReply({ content: `Votre ticket a été créé : ${ticketChannel}`, ephemeral: true });
    }
}
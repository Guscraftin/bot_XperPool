const { channel_staff, role_admins } = require(process.env.CONST);
const { Items, Members } = require("../../dbObjects");

module.exports = {
    data: {
        name: "shop_buy",
    },
    async execute(interaction) {
        const option = interaction.values[0];

        // Find the item
        let item;
        try {
            item = await Items.findOne({ where: { name: option } });
        } catch (error) {
            console.error("shop_buy.js item - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la recherche de l'article.", ephemeral: true });
        }
        if (!item) return interaction.reply({ content: "L'article n'existe pas.", ephemeral: true });

        // Check if the member has enough points
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de ton profil.", ephemeral: true });
        let memberScore;
        try {
            memberScore = await Members.findOne({ where: { member_id: member.id } });
        } catch (error) {
            console.error("shop_buy.js member - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de la recherche de ton score.", ephemeral: true });
        }
        if (!memberScore) return interaction.reply({ content: "Tu n'as pas de profil.", ephemeral: true });

        if (memberScore.score < item.price) return interaction.reply({ content: "Tu n'as pas assez de points pour acheter cet article.", ephemeral: true });

        // Send message to staff channel
        const staffChannel = await interaction.guild.channels.fetch(channel_staff).catch(() => null);
        if (!staffChannel) return interaction.reply({ content: "Votre achat a été annulé car nous n'avons pas pu envoyer de confirmation. Veuillez contacter un admin pour obtenir de l'assistance.", ephemeral: true });
        await staffChannel.send(`<@&${role_admins}>, ${interaction.member} a acheté l'article \`${item.id}\` nommé \`${item.name}\` pour \`${item.price}\` score.`);

        // Update the score of the member
        try {
            await memberScore.decrement('score', { by: item.price });
        } catch (error) {
            console.error("boutique.js buy updt - " + error);
            return interaction.reply({ content: "Une erreur est survenue lors de l'achat de l'article.", ephemeral: true });
        }

        // Send confirmation message
        return interaction.reply({ content: `Tu as acheté l'article \`${item.id}\` nommé \`${item.name}\` pour \`${item.price}\` score.`, ephemeral: true });
    }
}
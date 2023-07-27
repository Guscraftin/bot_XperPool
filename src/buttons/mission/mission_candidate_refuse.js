const { EmbedBuilder } = require("discord.js");
const { LogMissions, Missions } = require("../../dbObjects");
const { channel_all_missions, color_decline } = require(process.env.CONST);

/**
 * Come from src/buttons/mission/mission_accept.js
 */

module.exports = {
    data: {
        name: "mission_candidate_refuse",
    },
    async execute(interaction) {
        const userId = interaction.message.content.split(" ")[0].replace("<@", "").replace(">", "");

        // Get the mission id
        const mission = await Missions.findOne({ where: { channel_staff_id: interaction.channelId } });
        if (!mission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la mission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });

        // Get the logMission
        const logMission = await LogMissions.findOne({ where: { mission_id: mission.id, user_id: userId } });
        if (!logMission) return interaction.reply({ content: "Une erreur est survenue lors de la recherche de la logmission dans la base de donnée.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });

        // Get the channel of the mission for the user
        const channelDetail = await interaction.guild.channels.fetch(logMission.channel_details);
        if (!channelDetail) return interaction.reply({ content: "Une erreur est survenue lors de la recherche du channel de détails de la mission.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });

        // Get the title of the mission
        const channelAllMissions = await interaction.guild.channels.fetch(channel_all_missions);
        if (!channelAllMissions) return interaction.reply({ content: "Une erreur est survenue lors de la recherche du channel des missions.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
        const messageMission = await channelAllMissions.messages.fetch(mission.main_msg_id);
        const missionTitle = messageMission.embeds[0].fields[0].value;

        // Send a message to the user in his channel of details
        const embedAnswer = new EmbedBuilder().setDescription(`Cher <@${logMission.user_id}>,

J'espère que vous vous portez bien. Je me permets de vous recontacter au sujet de votre intérêt pour la mission **"${missionTitle}"** sur notre serveur Discord.

Après avoir étudié votre profil avec le client, nous regrettons de vous informer que vous ne répondez pas aux critères requis pour ce poste.

Nous vous remercions sincèrement pour votre contribution à l'évolution de notre communauté. N'hésitez surtout pas à postuler pour d'autres missions qui pourraient vous intéresser !

Bien cordialement,`).setColor(color_decline);
        await channelDetail.send({ content: `||<@${logMission.user_id}>||`, embeds: [embedAnswer] });

        // Modify the initial message
        const embed = new EmbedBuilder(interaction.message.embeds[0]);
        embed.setColor(color_decline);
        await interaction.message.edit({ embeds: [embed], components: [] });

        return interaction.reply({ content: "La candidature a bien été refusée.", ephemeral: true });
    },
};

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("docs")
        .setDescription("🔧 Permets d'envoyer des messages déjà conçus.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('message')
            .setDescription("L'id du message de la suggestion.")
            .addChoices(
                { name: "Bienvenue", value: "welcome" },
            )
            .setRequired(true)),
    async execute(interaction) {
        
        switch (interaction.options.getString("message")) {
            case "welcome":
                const owner = await interaction.guild.members.fetch(interaction.guild.ownerId);

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${owner.displayName}`, iconURL: owner.displayAvatarURL() })
                    .setTitle("La Communauté d'Experts !")
                    .setColor(656268)
                    .setThumbnail('https://images-ext-2.discordapp.net/external/sHMmkyKqLTBXwgigTcXBA0TCHhdTa4rIBfDt15wdWtA/https/cdn-longterm.mee6.xyz/plugins/embeds/images/1079366462050934784/bf7b417c7216b32a517d0a4abaa8679b74f15b334a800b49c16890b486b8e1cf.png?width=253&height=253')
                    .setDescription(`Bienvenue dans le réseau XperPool, nous sommes très heureux de vous accueillir sur ce serveur Discord dédié au Portage Salarial IT 😉

Afin de pouvoir rejoindre officiellement la communauté et accéder aux différents salons, allez vite remplir notre petit questionnaire pour récupérer votre accès !

https://tally.so/r/3EKPvN

Ici, vous pourrez discuter avec de nombreux professionnels de diverses secteurs, partager vos expériences et poser un tas de questions sur n'importe quel domaine.

Nous proposons également des missions adaptées à votre profil pour vous aider à développer votre carrière et votre montée en compétences !

N'hésitez pas à consulter les différentes sections du serveur, en commençant par le règlement, et à participer aux discussions.

L'équipe XperPool vous souhaite à tous la bienvenue 😃`)
                    .setImage("https://images-ext-1.discordapp.net/external/bpXrVyDFBNagVkp4fdSrb18PDhhq7xipFJdhkzkZXaQ/https/cdn-longterm.mee6.xyz/plugins/embeds/images/1079366462050934784/0b9e7285ca69b649abe7e9dded54bc7e452384a92d5359d92075d2ccf731fa01.png?width=866&height=214")


                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Site Web")
                            .setStyle(ButtonStyle.Link)
                            .setEmoji('1079367441387356200')
                            .setURL("https://xperpool.fr/"),
                    );

                await interaction.channel.send({ embeds: [embed], components: [row] });
                break;

            default:
                return interaction.reply({ content: "Ce message n'existe pas.", ephemeral: true });
        }

        return interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
    },
};
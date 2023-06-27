const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { role_members } = require(process.env.CONST);

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
                { name: "Règlement", value: "rules" },
                { name: "Avantages", value: "advantages" },
                { name: "Astuces", value: "tips" },
                { name: "Annonces", value: "annonces" },
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

            case "rules":
                const rules1 = `||@everyone||
# Règlement Serveur Discord
Merci à tous et bienvenue dans la communauté XperPool ! Pour pouvoir discuter avec la communauté, vous devez respecter certaines règles :

**1️⃣・Pas de débauchage**
Nous apprécions la nature collaborative et solidaire de notre communauté. Afin de maintenir un environnement équitable et respectueux, le débauchage est strictement interdit. Le débauchage se réfère à l'acte de solliciter ou de recruter nos membres pour des opportunités externes sans consentement préalable. Tout membre surpris en train de se livrer à des activités de débauchage sera banni définitivement du serveur !

**2️⃣・Respectez les règles définies par Discord**
Il est impératif de respecter les règles définies par Discord (https://discord.com/terms). Si certaines règles ne sont pas respectées, cela peut aller d'un ban de Discord même à des sanctions pénales.

**3️⃣・Manques de respects et menaces**
Aucun manque de respect ou menaces que ce soit envers le staff ou/et les membres ne sera toléré.

**4️⃣・Parler correctement et en français**
Le serveur étant principalement francophone et pour des raisons de compréhension entre membres, il vous est demandé de parler français dans les chat général. De plus il est conseillé d'écrire correctement (que ce soit lisible et compréhensible).

**5️⃣・Spam et troll**
Le spam et le troll ne sont pas autorisés.`
                const rules2 = `_ _
**6️⃣・Pub et pub message privé**
Les publicités (que ce soit sur le serveur ou en message privé) sont strictement interdites sous peine de bannissement.

**7️⃣・Soyez matures**
Aucune immaturité n'est acceptée, si cette règle n'est pas respectée, vous serez muté ou banni du serveur.

**8️⃣・Mentions**
Il est interdit de mentionner les <@&1116845041823002695>, si vous avez des questions nous avons mis en place un système de ticket pour vos requêtes.

**9️⃣・Discrimination**
Ne postez pas de contenu NSFW, et n'ayez pas de propos racistes, homophobes, sexistes et toutes autres formes de discriminations.

**🔟・Pseudo**
Nous modifions votre pseudo à votre entrée sur le serveur avec votre prénom et votre nom. Il s'agit d'un réseau professionnel, nous évitons donc les caractères spéciaux et tout autre nom d'utilisateur inventé.

Merci d'ouvrir un ticket dans <#1116845080410603520> en cas de problèmes.\n||@everyone||`

                await interaction.channel.send({ content: rules1 });
                await interaction.channel.send({ content: rules2 });
                break;

            case "advantages":
                const advantages = `
# Les avantages
Voici pour tous les <@&${role_members}>, des liens vers des outils externes pouvant améliorer votre quotidien dans votre vie professionnelle.

## :briefcase: Administratif
- **Freebe (30 jours d'essai gratuit) :** L'outil de gestion facturation en ligne pour les auto-entrepreneurs et micro-entrepreneurs.
 - <https://www.freebe.me>

## :construction_site: Création structure
- **Avocat dédié :** Nous mettons à votre disposition nos avocats pour suivre la création de votre structure.
- **Cabinet d'expertise comptable :** Nous vous mettons en relation avec notre cabinet comptable leader du marché.
- **Accompagnement personnalisé :** Nous vous proposons des conseils et un accompagnement personnalisé dans la création de votre structure par les entrepreneurs de la communauté.

## :coin: Banque / Epargne / Emprunt
- **Mon Petit Placement (Investissez dès 300€) :** La plateforme qui t'aide à faire fructifier ton épargne.
 - <https://www.monpetitplacement.fr>

## :shield: Santé
- **Swiss Life:** Mutuelle, RC Pro et prévoyance dédiée à notre communauté d'experts.
 - <https://www.swisslife.fr>

## :woman_teacher: Formations
- **Adservio Academy :** Accès à de multiples formations, que ce soit de nos experts internes ou de nos partenaires, LinkedIn Learning et Udemy.
 - <https://www.adservio.academy>`

                await interaction.channel.send({ content: advantages });
                break;

            case "tips":
                const tips = `
# 🚀 Démarrage de la semaine avec Angular ! 🚀
Bienvenue dans notre semaine thématique dédiée à Angular ! Nous sommes impatients de plonger dans l'univers de ce puissant framework JavaScript et d'explorer ses dernières mises à jour, ses meilleures pratiques et ses conseils d'optimisation des performances.

## 📰 Le point fort du jour : Dernières mises à jour sur Angular
Préparez-vous à découvrir les fonctionnalités et les améliorations les plus récentes qu'Angular a à offrir. Nous partagerons un article perspicace qui dévoile les derniers ajouts, améliorations et possibilités passionnantes pour la construction d'applications web modernes.

Restez à l'écoute tout au long de la semaine pour d'autres bonnes choses sur Angular, notamment des épisodes de podcast et des conseils d'experts sur l'exploitation du potentiel d'Angular pour offrir des expériences utilisateur exceptionnelles.`

                const embed1 = new EmbedBuilder()
                    .setTitle("Say Goodbye to Setters and Getters: Angular’s Transform Option for Input Values")
                    .setURL("https://medium.com/netanelbasal/say-goodbye-to-setters-and-getters-angulars-transform-option-for-input-values-88fd9442dcad")
                    .setDescription("Starting from Angular v16.1.0, a new helpful feature has been introduced to provide an alternative and easy way to transform input values…")
                    .setColor('#009ECA')

                await interaction.channel.send({ content: tips, embeds: [embed1] });
                break;


            case "annonces":
                const embed10 = new EmbedBuilder()
                    .setTitle("Pôle Emploi et création d'entreprise : comment ça fonctionne ?")
                    .setURL("https://app.livestorm.co/numbr/pole-emploi-et-creation-dentreprise-comment-ca-fonctionne?utm_source=Livestorm+company+page")
                    .setDescription("Le <t:1688720400:F> par Numbr.")
                    .setColor('#009ECA')

                const embed11 = new EmbedBuilder()
                    .setTitle("Je suis en Micro-entreprise, je dépasse les seuils de TVA, quoi faire ?")
                    .setURL("https://app.livestorm.co/numbr/je-suis-en-microentreprise-je-depasse-les-seuils-de-tva-quoi-faire?utm_source=Livestorm+company+page")
                    .setDescription("Le <t:1688979600:F> par Numbr.")
                    .setColor('#009ECA')

                const embed12 = new EmbedBuilder()
                    .setTitle("NUMBR x IMPS : 6 étapes pour faire décoller son activité")
                    .setURL("https://app.livestorm.co/numbr/5-etapes-pour-faire-decoller-son-activite?utm_source=Livestorm+company+page")
                    .setDescription("Le <t:1689066000:F> par Numbr.")
                    .setColor('#009ECA')

                await interaction.channel.send({ content: `# Voici le programme des webinars partenaires à venir :`, embeds: [embed10, embed11, embed12] });
                break;

            default:
                return interaction.reply({ content: "Ce message n'existe pas.", ephemeral: true });
        }

        return interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
    },
};
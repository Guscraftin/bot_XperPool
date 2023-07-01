const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, WebhookClient } = require('discord.js');
const { color_basic, role_admins, role_members } = require(process.env.CONST);

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
                { name: "Contacter-nous", value: "contact" },
                { name: "Bienvenue", value: "welcome" },
                { name: "Règlement", value: "rules" },
                { name: "Avantages", value: "advantages" },
                { name: "Details-Missions", value: "detailsMissions" },
                { name: "Staff-Missions", value: "staffMissions" },
                { name: "Astuces", value: "tips" },
                { name: "Annonces", value: "annonces" },
                { name: "Events", value: "events" },
            )
            .setRequired(true)),
    async execute(interaction) {
        if (interaction.options.getString("message") === "contact") {
            const embed = new EmbedBuilder()
                .setTitle("Contacter-nous")
                .setDescription("Vous pouvez nous contacter en cliquant sur le bouton 📩")
                .setColor(color_basic)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("contact")
                        .setLabel("Contacter-nous")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📩")
                );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: "Message envoyé !", ephemeral: true });
        }
        
        // Filter only the owner of the bot because this command it's useless for other people.
        const bot = await interaction.client.application.fetch();
        if (bot.owner.username !== undefined) {
            if (interaction.member.id !== bot.owner.id) {
                return interaction.reply({ content: "Cette commande est inutile pour vous à l'exception de l'option \`Contacter-nous\`. Veuillez utiliser les commandes `/embed` et `message` à la place.", ephemeral: true });
            }
        }

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

                const msg1 = await interaction.channel.send({ embeds: [embed], components: [row] });
                await msg1.pin();
                await interaction.channel.messages.fetch().then(messages => messages.first().delete());
                break;

            case "rules":
                const rules1 = `||@everyone||
# Règlement Serveur Discord
Merci à tous et bienvenue dans la communauté XperPool ! Pour pouvoir discuter avec la communauté, vous devez respecter certaines règles :

**1️⃣・Respectez les règles définies par Discord**
Il est impératif de respecter les règles définies par Discord (https://discord.com/terms). Si certaines règles ne sont pas respectées, cela peut aller d'un ban de Discord même à des sanctions pénales.

**2️⃣・Manques de respects et menaces**
Aucun manque de respect ou menaces que ce soit envers le staff ou/et les membres ne sera toléré.

**3️⃣・Discrimination**
Ne postez pas de contenu NSFW, et n'ayez pas de propos racistes, homophobes, sexistes et toutes autres formes de discriminations.

**4️⃣・Parler correctement et en français**
Le serveur étant principalement francophone et pour des raisons de compréhension entre membres, il vous est demandé de parler français dans les chat général. De plus il est conseillé d'écrire correctement (que ce soit lisible et compréhensible).

**5️⃣・Pas de débauchage**
Nous apprécions la nature collaborative et solidaire de notre communauté. Afin de maintenir un environnement équitable et respectueux, le débauchage est strictement interdit. Le débauchage se réfère à l'acte de solliciter ou de recruter nos membres pour des opportunités externes sans consentement préalable. Tout membre surpris en train de se livrer à des activités de débauchage sera banni définitivement du serveur !`
                const rules2 = `_ _
**6️⃣・Spam et troll**
Le spam et le troll ne sont pas autorisés.

**7️⃣・Pub et pub message privé**
Les publicités (que ce soit sur le serveur ou en message privé) sont strictement interdites sous peine de bannissement.

**8️⃣・Soyez matures**
Aucune immaturité n'est acceptée, si cette règle n'est pas respectée, vous serez muté ou banni du serveur.

**9️⃣・Mentions**
Il est interdit de mentionner les <@&1116845041823002695>, si vous avez des questions nous avons mis en place un système de ticket pour vos requêtes.

**🔟・Pseudo**
Nous modifions votre pseudo à votre entrée sur le serveur avec votre prénom et votre nom. Il s'agit d'un réseau professionnel, nous évitons donc les caractères spéciaux et tout autre nom d'utilisateur inventé.

Merci d'ouvrir un ticket dans <#1116845080410603520> en cas de problèmes.\n||@everyone||`

                const msg2 = await interaction.channel.send({ content: rules1 });
                await interaction.channel.send({ content: rules2 });
                await msg2.pin();
                await interaction.channel.messages.fetch().then(messages => messages.first().delete());
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

                const msg3 = await interaction.channel.send({ content: advantages });
                await msg3.pin();
                await interaction.channel.messages.fetch().then(messages => messages.first().delete());
                break;

            case "detailsMissions":
                const detailsMissions = `||<@&${role_members}>||
# Comment postuler à une mission ?

1. Choisissez une mission qui vous intéresse parmi les différentes offres disponibles dans les salons missions.
2. Cliquez sur le bouton vert "Je suis intéressé".
3. Vous serez mentionné dans une discussion dans ce salon, où vous pourrez trouver plus d'informations sur la mission sélectionnée.
4. Si la mission vous convient toujours, il vous suffit de "Accepter la mission".
5. Nous vous enverrons un e-mail pour prendre contact avec vous.`

                const msg4 = await interaction.channel.send({ content: detailsMissions });
                await msg4.pin();
                await interaction.channel.messages.fetch().then(messages => messages.first().delete());
                break;


            case "staffMissions":
                const staffMissions = `||<@&${role_admins}>||
# Comment créer une mission ?

1. Créez un fil de discussion public dans ce salon en incluant les détails de la mission dans le premier message (peu importe le nom du salon).
2. Utilisez la commande \`/mission add\`.
3. Si le récapitulatif des informations qui seront envoyées dans les salons missions vous convient, validez-le.
*Toutes les confirmations d'intérêt pour une mission seront directement envoyées dans le fil de discussion que vous avez créé pour la mission.*

# Comment gérer une mission ?
- Utilisez la commande \`/mission edit\` pour fermer ou ouvrir une mission.
- Utilisez la commande \`/getdb logmissions\` pour récupérer la base de données des personnes intéressées par une ou toutes les missions.
*Toutes les missions sont classées selon leur identifiant unique.*`

                const msg5 = await interaction.channel.send({ content: staffMissions });
                await msg5.pin();
                await interaction.channel.messages.fetch().then(messages => messages.first().delete());
                break;


            /**
             * WITH WEBHOOKS
             * Because this messages below are subject to change frequently, we use webhooks to send them with discord Dev Bot.
             * 
             */
            case "tips":
                const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1123509820218167447/158YbwUvNPdSVj00AMJtrRYaroFzYt-N8kWgw-tZwyBMJYpCiF89n6RoouRtSLLa6Ki-' });
                const tips = `
## :headphones: Un enthousiaste d'Angular nous parle de son expérience ! 

Nous sommes ravis de vous présenter l'épisode de podcast d'aujourd'hui dans le cadre de notre semaine Angular. Rejoignez-nous pour un voyage dans l'avenir d'Angular avec l'esprit brillant de Minko Gechev, un auteur et conférencier estimé de la communauté Angular.

:microphone2: Podcast : **"The Future of Angular" par AngularAir**
:microphone2: Invité vedette : **Minko Gechev**

Dans cet épisode captivant, Minko partage ses idées profondes et ses prédictions sur la direction que prend Angular. Obtenez un aperçu des fonctionnalités à venir, des avancées passionnantes et du paysage évolutif de ce puissant framework JavaScript.

:link: Regardez le podcast ici : https://www.youtube.com/live/s9ZFyMkDPmg?feature=share

:star2: Préparez-vous à explorer l'avenir d'Angular et à libérer votre potentiel de développement grâce aux réflexions d'expert de Minko Gechev ! :star2:
_ _`

                await webhookClient.send({ content: tips });
                break;


            case "annonces":
                const webhookClient2 = new WebhookClient({ url: 'https://discord.com/api/webhooks/1123509984748113962/8CmqhBC8pa_Gafb3ztHRGsWPCRmi6GK8yccGk_Ent9DXBvu7tuFp0voTmBGprKsChQeu' });
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

                await webhookClient2.send({ content: `# Voici le programme des webinars partenaires à venir :`, embeds: [embed10, embed11, embed12] });
                break;

            case "events":
                const webhookClient3 = new WebhookClient({ url: 'https://discord.com/api/webhooks/1123510249014439957/qEuTfzWmh6vOoLSQOV33FWTp_epBpfi7kQ_hPW7-Sm2NlyQK4HmXfMvx9fESgLBehbfY' });
                const missions = `Test moi !`

                await webhookClient3.send({ content: missions });
                break;

            default:
                return interaction.reply({ content: "Ce message n'existe pas.", ephemeral: true });
        }

        return interaction.reply({ content: "Message correctement envoyé !", ephemeral: true });
    },
};
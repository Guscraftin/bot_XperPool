const { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getdb")
        .setDescription("🔧 Permet d'obtenir des données en fichier excel de la base de données.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription("🔧 Permet d'obtenir des données en fichier excel des membres.")
                .addUserOption(option => option
                    .setName('membre')
                    .setDescription("L'utilisateur ou l'id de l'utilisateur dont on veut les informations.")))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logmissions')
                .setDescription("🔧 Permet d'obtenir des données en fichier excel concernant les missions.")
                .addStringOption(option => option
                    .setName('id')
                    .setDescription("L'id du message de la mission.")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('tickets')
            .setDescription("🔧 Permet d'obtenir des données en fichier excel des tickets.")
            .addUserOption(option => option.setName('membre').setDescription("L'utilisateur ou l'id de l'utilisateur à qui l'on souhaite récupérer les tickets."))
            .addStringOption(option => option
                .setName('categorie')
                .setDescription("La catégorie des tickets a récupérer.")
                .addChoices(
                    { name: 'Signaler un membre', value: 'Signaler un membre' },
                    { name: 'Problème sur une mission', value: 'Problème sur une mission' },
                    { name: 'Bug serveur', value: 'Bug serveur' },
                    { name: 'Question générale', value: 'Question générale' },
                ))
            .addStringOption(option => option
                .setName('type')
                .setDescription("Le type de ticket a récupérer.")
                .addChoices(
                    { name: 'Ouvert/Fermé', value: 'open' },
                    { name: 'Supprimé/Retranscrit', value: 'close' },
                )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('missions')
                .setDescription("🔧 Permet d'obtenir des données en fichier excel des missions."))
        .addSubcommand(subcommand =>
            subcommand
                .setName('items')
                .setDescription("🔧 Permet d'obtenir des données en fichier excel des items.")),
    async execute(interaction) {
        const tableName = interaction.options.getSubcommand();
        const id_mission = interaction.options.getString('id');
        const user = interaction.options.getUser('membre');
        const category = interaction.options.getString('categorie');
        let type = interaction.options.getString('type');

        let commandSQL = `SELECT * FROM ${tableName};`;
        
        /**
         * Get data from table 'Members'
         */
        if (tableName === 'members' && user) commandSQL = `SELECT * FROM ${tableName} WHERE member_id = '${user.id}';`;

        /**
         * Get data from table 'LogMissions'
         */
        if (tableName === 'logmissions' && id_mission) commandSQL = `SELECT * FROM ${tableName} WHERE mission_id = '${id_mission}';`;

        /**
         * Get data from table 'Tickets'
         */
        if (type === 'close') type = 'channel_id';
        else if (type === 'open') type = 'message_id';

        if (tableName === 'tickets') {
            if (user) {
                if (category) {
                    if (type) {
                        commandSQL = `SELECT * FROM ${tableName} WHERE user_id = '${user.id}' AND category = '${category}' AND ${type} IS NULL;`;
                    } else {
                        commandSQL = `SELECT * FROM ${tableName} WHERE user_id = '${user.id}' AND category = '${category}';`;
                    }
                } else if (type) {
                    commandSQL = `SELECT * FROM ${tableName} WHERE user_id = '${user.id}' AND ${type} IS NULL;`;
                } else {
                    commandSQL = `SELECT * FROM ${tableName} WHERE user_id = '${user.id}';`;
                }
            } else {
                if (category) {
                    if (type) {
                        commandSQL = `SELECT * FROM ${tableName} WHERE category = '${category}' AND ${type} IS NULL;`;
                    } else {
                        commandSQL = `SELECT * FROM ${tableName} WHERE category = '${category}';`;
                    }
                } else if (type) {
                    commandSQL = `SELECT * FROM ${tableName} WHERE ${type} IS NULL;`;
                }
            }
        }
        
        const sqliteFilePath = 'database.sqlite';
        const outputFilePath = 'db.xlsx';


        // Extract data from SQLite database and create Excel file
        let is_create = false;
        await extractDataFromSQLite(sqliteFilePath, commandSQL)
            .then((data) => {
                is_create = true;
                createExcelFile(data, outputFilePath);
            })
            .catch((error) => {
                if (error === 'Aucune donnée trouvée dans la base de données.') return interaction.reply({ content: "Aucun log avec les paramètres demandés n'a pu être trouvé.", ephemeral: true });
                else {
                    console.error('Une erreur s\'est produite :', error);
                    return interaction.reply({ content: "Une erreur s'est produite lors de la création du fichier Excel.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
                }
            });
        if (!is_create) return;

        // Send the file to the user
        return interaction.reply({
            content: `Voici toutes les logs demandés :`,
            files: [new AttachmentBuilder(outputFilePath)],
            ephemeral: true
        });
    },
};

// Function for extracting data from SQLite database
function extractDataFromSQLite(filePath, commandSQL) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filePath);

        db.all(commandSQL, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                if (rows.length === 0) reject('Aucune donnée trouvée dans la base de données.');
                else resolve(rows);
            }

            db.close();
        });
    });
}

// Function for creating Excel file
function createExcelFile(data, outputFilePath) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    XLSX.writeFile(workbook, outputFilePath);
}
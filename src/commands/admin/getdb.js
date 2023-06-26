const { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { channel_all_missions } = require('../../const.json');
const { Missions } = require('../../dbObjects');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');
const fs = require('fs');

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
                    .setName('user')
                    .setDescription("L'utilisateur dont on veut les informations.")))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logmissions')
                .setDescription("🔧 Permet d'obtenir des données en fichier excel concernant les missions.")
                .addStringOption(option => option
                    .setName('id')
                    .setDescription("L'id du message de la mission."))),
    async execute(interaction) {
        const tableName = interaction.options.getSubcommand();
        let id_mission = interaction.options.getString('id');
        const user = interaction.options.getUser('user');

        const user_id = user ? user.id : null;
        const value = id_mission ? id_mission : user_id;
        const fieldName = tableName === 'members' ? 'member_id' : 'mission_id';

        const sqliteFilePath = 'database.sqlite';
        const outputFilePath = 'db.xlsx';


        // Extract data from SQLite database and create Excel file
        let is_create = false;
        await extractDataFromSQLite(sqliteFilePath, tableName, fieldName, value)
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
        if (id_mission) {
            return interaction.reply({
                content: `Voici les logs de la mission avec l'id ${id_mission} :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        } else if (user_id) {
            return interaction.reply({
                content: `Voici les logs de l'utilisateur ${user_id} :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        } else if (tableName) {
            return interaction.reply({
                content: `Voici les logs de la table ${tableName} :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        } else {
            return interaction.reply({
                content: `Voici toutes les logs :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        }

    },
};

// Function for extracting data from SQLite database
function extractDataFromSQLite(filePath, tableName, fieldName, value) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filePath);
        let commandSQL = `SELECT * FROM ${tableName};`;
        if (value) commandSQL = `SELECT * FROM ${tableName} WHERE ${fieldName} = ${value};`;

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
const { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getlogmission")
        .setDescription("🔧 Permet d'obtenir les logs des réactions des membres sur les missions publiées.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const sqliteFilePath = 'database.sqlite';
        const tableName = 'logmissions';
        const outputFilePath = 'db.xlsx';

        await extractDataFromSQLite(sqliteFilePath, tableName)
            .then((data) => {
                createExcelFile(data, outputFilePath);
            })
            .catch((error) => {
                console.error('Une erreur s\'est produite :', error);
            });

        // Send the file to the user
        return interaction.reply({
            content: `Voici les logs de la mission :`,
            files: [new AttachmentBuilder('db.xlsx')],
            ephemeral: true
        });
    },
};

// Function for extracting data from SQLite database
function extractDataFromSQLite(filePath, tableName) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filePath);

        db.all(`SELECT * FROM ${tableName}`, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }

            db.close();
        });
    });
}

// Function for creating Excel file
function createExcelFile(data, outputFilePath) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    XLSX.writeFile(workbook, outputFilePath);
}
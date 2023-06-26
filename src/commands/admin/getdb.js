const { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { channel_all_missions } = require('../../const.json');
const { Missions } = require('../../dbObjects');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getdb")
        .setDescription("🔧 Permet d'obtenir les logs des réactions des membres sur les missions publiées.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('id')
            .setDescription("L'id du message de la mission.")),
    async execute(interaction) {
        const sqliteFilePath = 'database.sqlite';
        const tableName = 'logmissions';
        const fieldName = 'main_msg_id';
        let id_main_msg = interaction.options.getString('id');
        const outputFilePath = 'db.xlsx';

        // Get the main message
        if (id_main_msg) {
            if (!interaction.channel.name.includes("missions")) return interaction.reply({ content: "Cette commande ne peut être utilisée que dans un channel de missions sauf si vous voulez les logs de toutes les missions (dans ce cas, veuillez ne pas mettre d'id lors de l'envoi de cette commande).", ephemeral: true });

            if (interaction.channel.id !== channel_all_missions) {
                try {
                    const mission = await Missions.findOne({ where: { particular_msg_id: id_main_msg } });
                    if (!mission) return interaction.reply({ content: "Aucune mission n'a été trouvée avec cet id.", ephemeral: true });
                    id_main_msg = mission.main_msg_id;
                } catch (error) {
                    console.error(error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la récupération de la base de donnée.", ephemeral: true });
                }
            }
        }

        // Extract data from SQLite database and create Excel file
        let is_create = false;
        await extractDataFromSQLite(sqliteFilePath, tableName, fieldName, id_main_msg)
            .then((data) => {
                is_create = true;
                createExcelFile(data, outputFilePath);
            })
            .catch((error) => {
                if (error === 'Aucune donnée trouvée dans la base de données.') return interaction.reply({ content: "Aucun log pour la mission demandée n'a été trouvée.", ephemeral: true });
                else {
                    console.error('Une erreur s\'est produite :', error);
                    return interaction.reply({ content: "Une erreur s'est produite lors de la création du fichier Excel.\nVeuillez contacter un admins du serveur discord.", ephemeral: true });
                }
            });
        if (!is_create) return;

        // Send the file to the user
        if (id_main_msg) {
            return interaction.reply({
                content: `Voici les logs de la mission avec l'id ${id_main_msg} :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        } else {
            return interaction.reply({
                content: `Voici les logs de toutes les missions :`,
                files: [new AttachmentBuilder(outputFilePath)],
                ephemeral: true
            });
        }
    },
};

// Function for extracting data from SQLite database
function extractDataFromSQLite(filePath, tableName, fieldName, id_main_msg) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filePath);
        let commandSQL = `SELECT * FROM ${tableName};`;
        if (id_main_msg) commandSQL = `SELECT * FROM ${tableName} WHERE ${fieldName} = ${id_main_msg};`;

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
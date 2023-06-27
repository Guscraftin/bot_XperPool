const { Events, PermissionFlagsBits } = require('discord.js');
const { vocal_general } = require(process.env.CONST);

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState){

        /*
         * Manage the vocal_general channel 
         */
        // If the user is on the vocal_general channel
        if (oldState.channelId !== vocal_general && newState.channelId !== vocal_general) return;

        // When a user join the channel
        if (newState.channelId === vocal_general && (!oldState || newState.channelId !== oldState.channelId)) {
            const adminMembers = await newState.channel.members.filter(member => member.permissions.has(PermissionFlagsBits.Administrator));

            // If there are no admin, disconnect all users and lock the channel
            if (adminMembers.size <= 0) {
                await newState.channel.permissionOverwrites.edit(newState.guild.id, {
                    Connect: false
                });
                await newState.channel.members.each(member => {
                    member.voice.disconnect();
                });
            } else {
                // Allow the user to connect to the channel if there are at least one admin
                newState.channel.permissionOverwrites.edit(newState.guild.id, {
                    Connect: true
                });
            }
        }

        // When a user leave the channel
        if (oldState.channelId === vocal_general && (!newState || newState.channelId !== oldState.channelId)) {
            const adminMembers = await oldState.channel.members.filter(member => member.permissions.has(PermissionFlagsBits.Administrator));

            // If there are at least one admin, allow the user to connect to the channel
            if (adminMembers.size > 0) {
                await oldState.channel.permissionOverwrites.edit(oldState.guild.id, {
                    Connect: true
                });
            } else {
                // If there are no admin, disconnect all users and lock the channel
                await oldState.channel.permissionOverwrites.edit(oldState.guild.id, {
                    Connect: false
                });
                await oldState.channel.members.each(member => {
                    member.voice.disconnect();
                });
            }
        }
    }
};
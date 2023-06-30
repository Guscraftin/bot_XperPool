const { Events } = require('discord.js');
const { channel_suggestions } = require(process.env.CONST);
const { Members } = require('../../dbObjects');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(messageReaction, user){

        /**
         * Add score if user react in suggestions channel
         */
        if (messageReaction.message.channel.id === channel_suggestions) {
            try {
                const member = await Members.findOne({ where: { member_id: user.id } });
                if (member) {
                    await member.increment('score', { by: 5 });
                }
            } catch (error) {
                console.error("messageReactionAdd - " + error);
            }
        }
    }
};
const { Events } = require('discord.js');
const { Members, sequelize } = require('../../dbObjects');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        /*
         * Add score to member
         */
        try {
            if (message.author.bot) return;
            if (message.channel.type === 'DM') return;

            const member = await Members.findOne({ where: { member_id: message.author.id } });
            if (!member) {
                const force = process.argv.includes('--force') || process.argv.includes('-f');
                await sequelize.sync({ force }).then(async () => {
                    const memberDB = [
                        Members.upsert({ member_id: message.author.id, score: 1 }),
                    ];
                
                    await Promise.all(memberDB);
                }).catch(console.error);
            } else {
                // Check if member has send a message in the last 5 seconds
                if (member.is_messaging) return;

                // Update member score
                await member.update({ score: member.score + 1, is_messaging: true });
                setTimeout(async () => {
                    await member.update({ is_messaging: false });
                }
                , 5000);
            }
        } catch (error) {
            console.error("messageCreate.js AddScore - " + error);
        }
    }
};
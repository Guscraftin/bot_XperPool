const { Events } = require('discord.js');
const { Members, sequelize } = require('../../dbObjects');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
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
            await member.update({ score: member.score + 1 });
        }
    }
};
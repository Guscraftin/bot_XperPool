const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Member = require('./models/Member.js')(sequelize, Sequelize.DataTypes);
const Mission = require('./models/Mission.js')(sequelize, Sequelize.DataTypes);

module.exports = { Member, Mission, sequelize };
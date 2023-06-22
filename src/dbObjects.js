const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Members = require('./models/Members.js')(sequelize, Sequelize.DataTypes);
const Missions = require('./models/Missions.js')(sequelize, Sequelize.DataTypes);
const LogMissions = require('./models/LogMissions.js')(sequelize, Sequelize.DataTypes);


module.exports = { Members, Missions, LogMissions, sequelize };
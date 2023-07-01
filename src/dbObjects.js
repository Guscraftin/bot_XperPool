const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Items = require('./models/Items.js')(sequelize, Sequelize.DataTypes);
const Members = require('./models/Members.js')(sequelize, Sequelize.DataTypes);
const Missions = require('./models/Missions.js')(sequelize, Sequelize.DataTypes);
const LogMissions = require('./models/LogMissions.js')(sequelize, Sequelize.DataTypes);
const Tickets = require('./models/Tickets.js')(sequelize, Sequelize.DataTypes);


module.exports = { Items, Members, Missions, LogMissions, Tickets, sequelize };
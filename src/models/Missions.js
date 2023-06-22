module.exports = (sequelize, DataTypes) => {
    return sequelize.define('missions', {
        main_msg_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        particular_msg_id: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
        url_mission: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        }
    },);
};
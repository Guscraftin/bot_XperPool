module.exports = (sequelize, DataTypes) => {
    return sequelize.define('communities', {
        category_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        role_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        channel_mission_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
    },);
};
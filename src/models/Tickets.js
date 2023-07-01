module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tickets', {
        user_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        message_id: {
            type: DataTypes.STRING,
        },
        channel_id: {
            type: DataTypes.STRING,
        },
    },);
};
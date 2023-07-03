module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tickets', {
        category: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
        },
        channel_id: {
            type: DataTypes.STRING,
        },
        message_id: {
            type: DataTypes.STRING,
        },
        message_url: {
            type: DataTypes.STRING,
        },
    },);
};
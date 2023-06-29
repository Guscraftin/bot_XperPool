module.exports = (sequelize, DataTypes) => {
    return sequelize.define('missions', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        main_msg_id: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
        particular_msg_id: {
            type: DataTypes.STRING,
        },
        channel_particular_id: {
            type: DataTypes.STRING,
        },
        channel_staff_id: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
        is_open: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },);
};
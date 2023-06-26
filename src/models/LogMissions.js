module.exports = (sequelize, DataTypes) => {
    return sequelize.define('logmissions', {
        mission_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        channel_details:{
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        is_accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        is_react_main_msg: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },);
};
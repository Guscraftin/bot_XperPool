module.exports = (sequelize, DataTypes) => {
    return sequelize.define('logmissions', {
        main_msg_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            defaultValue: '0',
            unique: true,
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
        is_interested: {
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
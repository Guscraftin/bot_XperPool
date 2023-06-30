module.exports = (sequelize, DataTypes) => {
    return sequelize.define('items', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    },);
};
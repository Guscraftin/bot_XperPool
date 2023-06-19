module.exports = (sequelize, DataTypes) => {
    return sequelize.define('members', {
        member_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};
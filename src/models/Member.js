module.exports = (sequelize, DataTypes) => {
    return sequelize.define('member', {
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
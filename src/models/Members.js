module.exports = (sequelize, DataTypes) => {
    return sequelize.define('members', {
        member_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        first_name: {
            type: DataTypes.STRING,
            defaultValue: 'null',
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            defaultValue: 'null',
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: 'null',
            allowNull: false,
        },
        tel: {
            type: DataTypes.STRING,
            defaultValue: 'null',
            allowNull: false,
        },
        technologies: {
            type: DataTypes.TEXT,
            defaultValue: '[]',
            allowNull: false,
            get() {
                const data = this.getDataValue('technologies');
                return data ? JSON.parse(data) : [];
            },
            set(value) {
                const data = value ? JSON.stringify(value) : '[]';
                this.setDataValue('technologies', data);
            },
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        is_messaging: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    });
};
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
        particulars_msg_id: {
            type: DataTypes.TEXT,
            defaultValue: '[]',
            allowNull: false,
            get() {
                const data = this.getDataValue('particulars_msg_id');
                return data ? JSON.parse(data) : [];
            },
            set(value) {
                const data = value ? JSON.stringify(value) : '[]';
                this.setDataValue('particulars_msg_id', data);
            },
        },
        channel_particulars_id: {
            type: DataTypes.TEXT,
            defaultValue: '[]',
            allowNull: false,
            get() {
                const data = this.getDataValue('channel_particulars_id');
                return data ? JSON.parse(data) : [];
            },
            set(value) {
                const data = value ? JSON.stringify(value) : '[]';
                this.setDataValue('channel_particulars_id', data);
            },
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
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('locationHistories', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'userId'
        },
        location: {
            type: DataTypes.JSON,
            allowNull: false,
            field: 'location'
        },
        dateCreated: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'dateCreated'
        }
    }, {
        tableName: 'locationHistories',
        timestamps: false
    });
};

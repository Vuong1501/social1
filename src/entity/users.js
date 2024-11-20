/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'username'
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'password'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'fullname'
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'email'
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'mobile'
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'address'
      },
      userGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userGroupsId'
      },

      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      // dateExpire: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      //   field: 'dateExpire'
      // },
      status: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        field: 'status'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        field: 'image'
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );
};

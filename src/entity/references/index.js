

export default models => {
  // eslint-disable-next-line no-empty-pattern
  const { menuPositions, menus, users, userGroups, districts, provinces, userTokens, userGroupRoles, orders, orderDetail, products, orderStatusHistory } = models;

  menus.belongsTo(menus, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  menus.belongsTo(menuPositions, {
    foreignKey: 'menuPositionsId',
    as: 'menuPositions'
  });
  menus.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  menus.hasMany(userGroupRoles, {
    foreignKey: 'menusId',
    as: 'userGroupRoles'
  });

  menuPositions.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  users.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });
  userGroupRoles.belongsTo(menus, {
    foreignKey: 'menusId',
    as: 'menus'
  });
  userGroupRoles.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });

  districts.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });

  userGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  users.hasMany(userTokens, {
    foreignKey: 'usersId',
    as: 'userTokens'
  });

  userTokens.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });

  // mối quan hệ giữa users và orders
  users.hasMany(orders, {
    foreignKey: 'user_id',
    as: 'orders'
  });

  orders.belongsTo(users, {
    foreignKey: 'user_id',
    as: 'users'
  });
  // mối quan hệ giữa product và orderDetai
  products.hasMany(orderDetail, {
    foreignKey: 'product_id',
    as: 'orderdetail'
  });
  orderDetail.belongsTo(products, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // mối quan hệ giữa orders và orderDetail

  orders.hasMany(orderDetail, {
    foreignKey: 'order_id',
    as: 'orderdetail'
  });
  orderDetail.belongsTo(orders, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // mối quan hệ giữa orders và orderstatushistory

  orders.hasMany(orderStatusHistory, {
    foreignKey: 'order_id',
    as: 'orderStatusHistory'
  });
  orderStatusHistory.belongsTo(orders, {
    foreignKey: 'order_id',
    as: 'order'
  });
};

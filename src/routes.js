import { Router } from 'express';

// NOTE: ADD BY TRINH MINH HIEU

import currentUserRoutes from './routes/currentUserRoutes';

import districtsRoutes from './routes/districtsRoutes';
import menusRoutes from './routes/menusRoutes';

import userGroupRolesRoutes from './routes/userGroupRolesRoutes';

import userGroupsRoutes from './routes/userGroupsRoutes';
import usersRoutes from './routes/usersRoutes';
import provincesRoutes from './routes/provincesRoutes';
import menuPositionsRoutes from './routes/menuPositionsRoutes';

import productsRoutes from './routes/productsRoutes';
import ordersRoutes from './routes/orderRoutes';

// TODO

const router = Router();

/**
 * GET /swagger.json
 */

/**
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

// MARK ADD BY TRINH MINH HIEU

router.use('/c/districts', districtsRoutes);

router.use('/c/menus', menusRoutes);

router.use('/c/provinces', provincesRoutes);

router.use('/c/userGroups', userGroupsRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/userGroupRoles', userGroupRolesRoutes);
//  END
router.use('/c/currentUser', currentUserRoutes);
router.use('/c/menuPositions', menuPositionsRoutes);

router.use('/c/products', productsRoutes);
router.use('/c/orders', ordersRoutes);

export default router;

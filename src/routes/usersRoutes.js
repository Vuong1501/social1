import { Router } from 'express';

import usersController from '../controllers/usersController';
import usersValidate from '../validates/usersValidate';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', usersValidate.authenFilter, usersController.get_list);
// router.get("/export", usersValidate.authenFilter, usersController.get_list_export)
router.get('/:id', usersController.get_one);
router.post('/', usersValidate.authenCreate, usersController.create);
router.post('/register', usersValidate.authenCreate, usersController.register);
router.put('/:id', usersValidate.authenUpdate, usersController.update);
router.put('/update-status/:id', usersValidate.authenUpdate_status, usersController.update_status);
router.put('/changePass/:id', usersController.changePass);
router.put('/resetPass/:id', usersController.resetPass);
router.post('/requestForgetPass', usersValidate.authenRequestForgetPass, usersController.requestForgetPass);
router.post('/changePassByOpt', usersController.changePassByOtp);
router.post('/accessOtp', usersController.accessOtp);

export default router;

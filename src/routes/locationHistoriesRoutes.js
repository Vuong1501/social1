import { Router } from 'express';


import locationController from '../controllers/locationHistoriesController';
import locationValidate from '../validates/locationValidate';


const router = Router();

router.post('/create', locationValidate.authenCreate, locationController.createLocation);

export default router;
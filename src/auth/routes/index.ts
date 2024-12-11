import express, { NextFunction } from 'express';
import { UserController } from '../controller/auth-controller';
import { authorized } from '../middleware/authorization';
import { Validations } from '../helpers/validations';
import { upload } from '../middleware/multer';

const validations = new Validations();
const newUserController = new UserController(validations);

const routerAuth = express.Router();



routerAuth.post('/create-user', newUserController.createUser);
routerAuth.post('/login', newUserController.login);
routerAuth.get('/profile', authorized ,newUserController.profile );
routerAuth.get('/obtain-user-by-Id/:id', newUserController.obtainUserById);
routerAuth.post('/update-user-by-Id/:id', authorized, upload.single('image'), newUserController.updateUserById);
routerAuth.post('/update-plan-user/:id', authorized, newUserController.updatePlanByUser);
export default routerAuth;

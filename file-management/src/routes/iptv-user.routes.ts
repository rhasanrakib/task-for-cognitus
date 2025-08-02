import { Router } from 'express';
import { IptvUserController } from '../controllers/iptv-user.controller';

const router = Router();
const iptvUserController = new IptvUserController();

// GET routes
router.get('/users', iptvUserController.getAllUsers);
router.get('/users/:id', iptvUserController.getUserById);
router.get('/users/username/:username', iptvUserController.getUserByUserName);

// DELETE routes
router.delete('/users/:id', iptvUserController.deleteUser);

export default router;

import { Router } from "express";
import * as authController from "../../controllers/authController";

const router = Router();

router.get('/login', authController.checkLogin);
router.post('/login', authController.login);

export default router;

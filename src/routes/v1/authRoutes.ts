import { Router } from "express";
import * as authController from "../../controllers/authController.js";

const router = Router();

router.post('/register', authController.register);

export default router;

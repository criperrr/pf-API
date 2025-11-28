import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import { checkBody } from "../../middlewares/checkBody.js";

const router = Router();

router.use(checkBody);

router.post('/register', authController.register);
router.post('/login', authController.login);


export default router;

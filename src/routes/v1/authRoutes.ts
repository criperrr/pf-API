import { Router } from "express";

import * as authController from "../../controllers/authController.js";

import { checkBody } from "../../middlewares/checkBody.js";
import { checkAuth } from "../../middlewares/checkAuth.js";

const router = Router();

router.use(checkBody);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/tokens", authController.createMasterToken, checkAuth);

export default router;

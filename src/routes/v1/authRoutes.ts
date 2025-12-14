import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import { checkBody } from "../../middlewares/checkBody.js";
import { checkJwtAuth } from "../../middlewares/checkJwtAuth.js";

const router = Router();

router.use(checkBody);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/tokens", authController.createMasterToken, checkJwtAuth);

export default router;

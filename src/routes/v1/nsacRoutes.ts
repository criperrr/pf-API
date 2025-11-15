import { Router } from "express";
import * as nsacController from "../../controllers/nsacController.js";
import { checkJwtAuth } from "../../middlewares/checkJwtAuth.js";
import { checkApiKeyAuth } from "../../middlewares/checkApiKeyAuth.js";
const router = Router();

router.post("/accounts", checkJwtAuth, nsacController.createToken);
router.get("/accounts", checkJwtAuth, nsacController.getTokens);
router.delete("/accounts", checkJwtAuth, nsacController.deleteTokens);

router.get("/grades/class", nsacController.getClassGrades);
router.get("/grades/private", nsacController.getPrivateGrades);
router.get("/grades", nsacController.getAllGrades);

export default router;

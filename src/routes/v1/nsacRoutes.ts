import { Router } from "express";
import * as nsacController from "../../controllers/nsacController.js";
import { checkJwtAuth } from "../../middlewares/checkJwtAuth.js";
import { checkApiKeyAuth } from "../../middlewares/checkNsacToken.js";
const router = Router();

router.use("/accounts", checkJwtAuth);
router.use("/grades", checkApiKeyAuth);

router.post("/accounts", nsacController.createToken);
// router.get("/accounts", nsacController.getTokens);
// router.delete("/accounts", nsacController.deleteTokens);

// router.get("/grades/class", nsacController.getClassGrades);
// router.get("/grades/private", nsacController.getPrivateGrades);
router.get("/grades", nsacController.getAllGrades);

export default router;

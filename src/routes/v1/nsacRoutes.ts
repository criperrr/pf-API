import { Router } from "express";
import * as nsacController from "../../controllers/nsacController.js";
import { checkJwtAuth } from "../../middlewares/checkJwtAuth.js";
import { checkApiKeyAuth } from "../../middlewares/checkNsacToken.js";
import { checkBody } from "../../middlewares/checkBody.js";
const router = Router();

router.get("/accounts/token-status", nsacController.checkApiKeyAuth);

router.use("/accounts", checkJwtAuth);
router.use("/accounts", checkBody);
router.use("/grades", checkApiKeyAuth);

router.post("/accounts", nsacController.createToken);
router.get("/accounts", nsacController.getTokens);
router.delete("/accounts", nsacController.deleteTokens);

router.get("/grades", nsacController.getApiGrades);


export default router;

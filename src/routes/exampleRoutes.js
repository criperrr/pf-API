import { Router } from "express";
import * as exampleController from "../controllers/exampleController.js";

const router = Router();

router.get('/', exampleController.testeBrincando);
router.post('/', exampleController.testeBrincando)

export default router;
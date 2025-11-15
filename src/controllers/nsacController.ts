// router.post("/accounts", checkJwtAuth, nsacController.createToken);
// router.get("/accounts", checkJwtAuth, nsacController.getTokens);
// router.delete("/accounts", checkJwtAuth, nsacController.deleteTokens);

// router.get("/grades/class", nsacController.getClassGrades);
// router.get("/grades/private", nsacController.getPrivateGrades);
// router.get("/grades", nsacController.getAllGrades);

export async function createToken(req: Request, res: Response) {}

export async function getTokens(req: Request, res: Response) {}

export async function deleteTokens(req: Request, res: Response) {}

export async function getClassGrades(req: Request, res: Response) {}

export async function getPrivateGrades(req: Request, res: Response) {}

export async function getAllGrades(req: Request, res: Response) {}

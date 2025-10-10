import e from "express";
import "dotenv/config";
import * as exampleRoutes from './routes/exampleRoutes.js';

const app = e();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`RUNNING at ${port}`);
})

app.use('/api/tests', exampleRoutes.default)

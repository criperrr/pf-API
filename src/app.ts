import e,{ Express } from "express";
import "dotenv/config";
import exampleRoutes from './routes/v1/exampleRoutes.js';

const app: Express = e();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`RUNNING at ${port}`);
})

app.use('/api/tests', exampleRoutes)

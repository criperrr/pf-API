import e,{ Express } from "express";
import "dotenv/config";
import exampleRoutes from './routes/v1/exampleRoutes.js';
import authRoutes from './routes/v1/authRoutes.js';

const app: Express = e();
app.use(e.json())
app.use(e.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`RUNNING at ${port}`);
})

app.use('/api/tests', exampleRoutes);
app.use('/api/auth', authRoutes);


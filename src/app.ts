import e,{ Express } from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from './routes/v1/authRoutes.js';
import nsacRoutes from './routes/v1/nsacRoutes.js';

const app: Express = e();
app.use(e.json());
app.use(cookieParser())
app.use(e.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`RUNNING at ${port}`);
})

app.use('/api/nsac', nsacRoutes)
app.use('/api/auth', authRoutes);


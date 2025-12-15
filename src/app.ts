import e from "express";
import "dotenv/config";
// import { ensureDbCreated } from "./utils/database.js";
// (async () => {
//     await ensureDbCreated();
// })();
import authRoutes from "./routes/v1/authRoutes.js";
import nsacRoutes from "./routes/v1/nsacRoutes.js";
import cors from "cors";
import { globalErrorHandling } from "./utils/errorHandler.js";

const app = e();

app.set("query parser", "extended");
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`RUNNING at ${port}`);
});

app.use("/api/nsac", nsacRoutes);
app.use("/api/auth", authRoutes);

app.use(globalErrorHandling);

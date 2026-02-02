import e from "express";
/* drop dotenv bc env variables are in netlify process now */
// import "dotenv/config";
import authRoutes from "./routes/v1/authRoutes.js";
import nsacRoutes from "./routes/v1/nsacRoutes.js";
import cors from "cors";
import { globalErrorHandling } from "./utils/errorHandler.js";
const app = e();

app.set("query parser", "extended");
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(cors());

/* TESTING IMPLEMENTATION OF SERVERLESS-HTTP */
// const port = process.env.PORT || 3000;
// app.listen(port, async () => {
//     console.log(`RUNNING at ${port}!`);
//     // console.log("Trying to connect to PostgreSQL database and ensure all tables are created!");
//     // await ensureDbCreated();
// });
/* ***************************************** */
app.use("/api/test", async (req, res) => {
    res.status(200).json({ tron: "cutron" });
});
app.use("/api/nsac", nsacRoutes);
app.use("/api/auth", authRoutes);

app.use(globalErrorHandling);

export default app;

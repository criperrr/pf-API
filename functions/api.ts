import app from "../src/app.js";
import serverless from "serverless-http"

export const handler = serverless(app, { provider: "aws" }); // netlify uses aws as base, basically they're the same

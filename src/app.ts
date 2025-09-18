import express from "express";
import { requestLogger } from "./middlewares/logger";
import paymentRouter from "./routes/payment";

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api/payment", paymentRouter);

export default app;

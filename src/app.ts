import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import pictureRouter from "./routes/picture";
import patchRouter from "./routes/confirmRouter";

dotenv.config();

const app = express();
const port = 3000;

console.log(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use("/pictures", pictureRouter);
app.use("/confirm", patchRouter);

app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`);
});
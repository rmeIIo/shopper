import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import pictureRouter from "./routes/picture";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/pictures", pictureRouter);

async function main() {
  await mongoose.connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@uploadimg.g6xdl.mongodb.net/?retryWrites=true&w=majority&appName=uploadImg`
  );

  console.log("Conectado ao banco de dados");
}

main().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`);
});

const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", true);

async function main() {
  await mongoose.connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@uploadimg.g6xdl.mongodb.net/?retryWrites=true&w=majority&appName=uploadImg`
  );

  console.log("Conectado ao banco de dados");
}

main().catch((err) => console.log(err));

module.exports = main;
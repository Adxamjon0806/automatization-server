import express from "express";
import router from "./router.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bot from "./botInstance.js";

const __filename = fileURLToPath(import.meta.url); // абсолютный путь к файлу
const __dirname = path.dirname(__filename);

const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("", router);
dotenv.config();

const dbURI = process.env.MONGO_DB_URL;

const start = async () => {
  try {
    await mongoose.connect(dbURI);

    app.listen(port, () => {
      console.log("Server started at http://localhost:5000");
    });
  } catch (e) {
    console.error("Failed to start", e);
  }
};

start();

bot.on("message", (msg) => {
  console.log(msg);
});

export { __dirname };

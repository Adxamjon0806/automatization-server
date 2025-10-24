import express from "express";
import router from "./router.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url); // абсолютный путь к файлу
const __dirname = path.dirname(__filename);

const port = 5000;

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // или твой домен вместо "*"
  res.header("Access-Control-Expose-Headers", "Content-Disposition");
  next();
});
app.use(cors());
app.use(express.json());
app.use("", router);

const start = () => {
  try {
    app.listen(port, () => {
      console.log("Server started at http://localhost:5000");
    });
  } catch (e) {
    console.error("Failed to start", e);
  }
};

start();

export { __dirname };

import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

let bot;

if (!global.botInstance) {
  console.log("🤖 Создание нового экземпляра Telegram бота...");
  global.botInstance = new TelegramBot(token, { polling: true });
  console.log("✅ Telegram бот успешно создан");
} else {
  console.log("♻️ Используем существующий экземпляр Telegram бота");
}

bot = global.botInstance;

export default bot;

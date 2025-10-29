import dotenv from "dotenv";
import fs from "fs";
import bot from "./botInstance.js";

dotenv.config();

const firstChatId = process.env.FIRST_CHAT_ID;
const secondChatId = process.env.SECOND_CHAT_ID;

export async function sendDocumentToFirst(filePath, data) {
  console.log("📤 [sendDocumentToFirst] запуск функции, путь:", filePath);
  try {
    // Проверим наличие файла
    if (!fs.existsSync(filePath)) {
      console.error("❌ File does not exist:", filePath);
      return;
    }

    const fileStream = fs.createReadStream(filePath);

    let textToSenders = data.sendingMethod
      ? `Прошу выслать по ${data.sendingMethod == "didox" ? "Дидоксу" : ""}${
          data.sendingMethod != "didox" ? data.sendingMethod : ""
        }\n`
      : "";

    const sentMessage = await bot.sendDocument(firstChatId, fileStream, {
      caption:
        textToSenders + data.companyName
          ? `ИНН: ${data.inn}`
          : `ПИНФЛ: ${data.pinfl}`,
    });

    console.log("✅ Document successfully sent:", sentMessage.message_id);
  } catch (e) {
    console.error("❌ Error at sending document to telegram group:", e.message);
  }
}

export async function sendTextToGroup(data, count, companyInitialLetter) {
  try {
    let tarrifCaptions = "";

    if (data.tarrifs?.length) {
      for (let i = 0; i < data.tarrifs.length; i++) {
        const { name, price, count: c } = data.tarrifs[i];
        tarrifCaptions += `${name} по ${price} сум - ${c} шт\n`;
      }
    }

    if (data.abonentTarrifs?.length) {
      for (let i = 0; i < data.abonentTarrifs.length; i++) {
        const { name, price, count: c, term } = data.abonentTarrifs[i];
        tarrifCaptions += `Тариф ${name} по ${price} сум на ${term} месяца - ${c} шт\n`;
      }
    }

    const caption =
      `${companyInitialLetter}-25/${count} ${
        data.companyName ? data.companyName : data.personName
      }\n` + tarrifCaptions;

    await bot.sendMessage(secondChatId, caption);
    console.log("✅ Text message sent to group.");
  } catch (e) {
    console.error("❌ Error at sending text to telegram group:", e.message);
  }
}
